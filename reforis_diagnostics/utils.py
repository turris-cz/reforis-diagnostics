from http import HTTPStatus

from flask import jsonify


class DiagnosticsAPIError(Exception):
    def __init__(self, data, status_code):
        super().__init__(data)
        self.data = data
        self.status_code = status_code


def validate_json(json_data, expected_fields):
    if not json_data:
        raise DiagnosticsAPIError(jsonify('Invalid JSON'), HTTPStatus.BAD_REQUEST)

    errors = {}

    for field_name, field_type in expected_fields.items():
        field = json_data.get(field_name)
        if not field:
            errors[field_name] = 'Missing data for required field.'
        elif not isinstance(field, field_type):
            errors[field_name] = f'Expected data of type: {field_type.__name__}'

    if errors:
        raise DiagnosticsAPIError(jsonify(errors), HTTPStatus.BAD_REQUEST)
