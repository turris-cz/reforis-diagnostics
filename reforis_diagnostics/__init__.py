#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

import gzip
import io
from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, request, send_file, jsonify
from flask_babel import gettext as _

from .utils import DiagnosticsAPIError, validate_json

BASE_DIR = Path(__file__).parent

# pylint: disable=invalid-name
blueprint = Blueprint('Diagnostics', __name__, url_prefix='/diagnostics/api')

# pylint: disable=invalid-name
diagnostics = {
    'blueprint': blueprint,
    'js_app_path': 'diagnostics/app.min.js',
    'translations_path': BASE_DIR / 'translations',
}


@blueprint.route('/modules', methods=['GET'])
def get_modules():
    return jsonify(current_app.backend.perform('diagnostics', 'list_modules'))


@blueprint.route('/reports', methods=['GET'])
def get_reports():
    return jsonify(current_app.backend.perform('diagnostics', 'list_diagnostics')['diagnostics'])


@blueprint.route('/reports', methods=['POST'])
def post_report():
    try:
        validate_json(request.json, {'modules': list})
    except DiagnosticsAPIError as error:
        return error.data, error.status_code

    response = current_app.backend.perform('diagnostics', 'prepare_diagnostic', request.json)
    if not response.get('diag_id'):
        current_app.logger.error('Invalid backend response for creating diagnostics report: %s', response)
        return jsonify(_('Cannot create diagnostics report')), HTTPStatus.INTERNAL_SERVER_ERROR
    return jsonify(response), HTTPStatus.ACCEPTED


@blueprint.route('/reports/<report_id>', methods=['GET'])
def get_report_meta(report_id):
    try:
        return jsonify(_get_report_details(report_id))
    except DiagnosticsAPIError as error:
        return error.data, error.status_code


@blueprint.route('/reports/<report_id>/contents', methods=['GET'])
def get_report_contents(report_id):
    try:
        report = _get_report_details(report_id)
    except DiagnosticsAPIError as error:
        return error.data, error.status_code

    if report['status'] != 'ready':
        return jsonify(_('Requested report is not ready yet')), HTTPStatus.CONFLICT

    return _send_diagnostics_file(report['path'], f'{report_id}.txt.gz')


def _get_report_details(report_id):
    reports = current_app.backend.perform('diagnostics', 'list_diagnostics')['diagnostics']
    search_result = next((report for report in reports if report['diag_id'] == report_id), None)
    if not search_result:
        raise DiagnosticsAPIError(jsonify(_('Requested report does not exist')), HTTPStatus.NOT_FOUND)
    return search_result


def _send_diagnostics_file(filepath, filename):
    with open(filepath, 'rb') as file_in:
        buffer = io.BytesIO()
        file_out = gzip.GzipFile(filename=filename, mode='wb', fileobj=buffer)
        file_out.write(file_in.read())
        file_out.flush()
        file_out.close()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, attachment_filename=filename)


@blueprint.route('/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    response = current_app.backend.perform(
        'diagnostics',
        'remove_diagnostic',
        {'diag_id': report_id},
    )
    if not response['result']:
        current_app.logger.error('Invalid backend response for deleting diagnostics report: %s', response)
        return jsonify(_('Cannot delete report')), HTTPStatus.INTERNAL_SERVER_ERROR
    return '', HTTPStatus.NO_CONTENT
