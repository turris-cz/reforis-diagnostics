#  Copyright (C) 2019-2023 CZ.NIC z.s.p.o. (https://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

""" Diagnostics module for Foris Controller API """

import gzip
import io
from http import HTTPStatus
from pathlib import Path

from flask import Blueprint, current_app, request, send_file, jsonify
from flask_babel import gettext as _

from reforis.foris_controller_api.utils import APIError, validate_json


BASE_DIR = Path(__file__).parent


blueprint = Blueprint('Diagnostics', __name__, url_prefix='/diagnostics/api')


diagnostics = {
    'blueprint': blueprint,
    'js_app_path': 'reforis_diagnostics/js/app.min.js',
    'translations_path': BASE_DIR / 'translations',
}


@blueprint.route('/modules', methods=['GET'])
def get_modules():
    """
    Returns a JSON response containing a list of diagnostic modules.
    """
    return jsonify(current_app.backend.perform('diagnostics', 'list_modules'))


@blueprint.route('/reports', methods=['GET'])
def get_reports():
    """
    Returns a JSON response containing a list of diagnostic reports.
    """
    return jsonify(current_app.backend.perform('diagnostics', 'list_diagnostics')['diagnostics'])


@blueprint.route('/reports', methods=['POST'])
def post_report():
    """
    Accepts a JSON request containing a list of diagnostic modules
    and returns a JSON response containing a diagnostic report.
    """
    validate_json(request.json, {'modules': list})
    response = current_app.backend.perform('diagnostics', 'prepare_diagnostic', request.json)
    if not response.get('diag_id'):
        raise APIError(_('Cannot create diagnostics report'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return jsonify(response), HTTPStatus.ACCEPTED


@blueprint.route('/reports/<report_id>', methods=['GET'])
def get_report_meta(report_id):
    """
    Returns a JSON response containing metadata of a diagnostic report.
    """
    return jsonify(_get_report_details(report_id))


@blueprint.route('/reports/<report_id>/contents', methods=['GET'])
def get_report_contents(report_id):
    """
    Returns a gzipped text file containing the contents of a diagnostic report.
    """
    report = _get_report_details(report_id)
    if report['status'] != 'ready':
        raise APIError(_('Requested report is not ready yet'), HTTPStatus.CONFLICT)
    return _send_diagnostics_file(report['path'], f'{report_id}.txt.gz')


def _get_report_details(report_id):
    reports = current_app.backend.perform('diagnostics', 'list_diagnostics')['diagnostics']
    search_result = next((report for report in reports if report['diag_id'] == report_id), None)
    if not search_result:
        raise APIError(_('Requested report does not exist'), HTTPStatus.NOT_FOUND)
    return search_result


def _send_diagnostics_file(filepath, filename):
    with open(filepath, 'rb') as file_in:
        buffer = io.BytesIO()
        file_out = gzip.GzipFile(filename=filename, mode='wb', fileobj=buffer)
        file_out.write(file_in.read())
        file_out.flush()
        file_out.close()
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name=filename)


@blueprint.route('/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    """
    Deletes a diagnostic report.
    """
    response = current_app.backend.perform(
        'diagnostics',
        'remove_diagnostic',
        {'diag_id': report_id},
    )
    if response.get('result') is not True:
        raise APIError(_('Cannot delete report'), HTTPStatus.INTERNAL_SERVER_ERROR)
    return '', HTTPStatus.NO_CONTENT
