from http import HTTPStatus
from unittest.mock import mock_open, patch

from utils import get_mocked_client


def test_get_reports(app):
    backend_response = {'diagnostics': []}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/diagnostics/api/reports')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['diagnostics']


def test_post_reports(app):
    backend_response = {'diag_id': '1234ABCD'}
    with get_mocked_client(app, backend_response) as client:
        response = client.post(
            '/diagnostics/api/reports',
            json={'modules': ['foobar_module']},
        )
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == backend_response


def test_post_reports_invalid_json(app):
    with get_mocked_client(app, {}) as client:
        response = client.post('/diagnostics/api/reports')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


def test_post_reports_missing_data(app):
    with get_mocked_client(app, {}) as client:
        response = client.post(
            '/diagnostics/api/reports',
            json={'different_field': 'some_value'},
        )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'modules': 'Missing data for required field.'}


def test_post_reports_invalid_data(app):
    with get_mocked_client(app, {}) as client:
        response = client.post(
            '/diagnostics/api/reports',
            json={'modules': 1234},
        )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'modules': 'Expected data of type: list'}


def test_post_reports_backend_error(app):
    backend_response = {'something_else': 'meaningless_value'}
    with get_mocked_client(app, backend_response) as client:
        response = client.post('/diagnostics/api/reports', json={'modules': ['foobar_module']})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot create diagnostics report'


def test_get_report_meta(app):
    backend_response = {'diagnostics': [{'diag_id': '1234'}]}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['diagnostics'][0]


def test_get_report_meta_not_found(app):
    backend_response = {'diagnostics': [{'diag_id': '5678'}]}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested report does not exist'


def test_get_report_contents(app):
    backend_response = {
        'diagnostics': [
            {'diag_id': '1234', 'status': 'ready', 'path': 'path: /tmp/diagnostics-2019-09-17_c907711c.out'}
        ]
    }
    with get_mocked_client(app, backend_response) as client:
        opener = mock_open(read_data=b'DATA')
        with patch('reforis_diagnostics.open', opener):
            response = client.get('/diagnostics/api/reports/1234/contents')
    assert response.status_code == HTTPStatus.OK
    # Expect to receive some gzipped content
    assert response.data


def test_get_report_contents_not_ready(app):
    backend_response = {'diagnostics': [{'diag_id': '5678', 'status': 'pending'}]}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/diagnostics/api/reports/5678/contents')
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == 'Requested report is not ready yet'


def test_get_report_contents_not_found(app):
    backend_response = {'diagnostics': [{'diag_id': '5678'}]}
    with get_mocked_client(app, backend_response) as client:
        response = client.get('/diagnostics/api/reports/1234/contents')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested report does not exist'


def test_delete_report(app):
    backend_response = {'result': True}
    with get_mocked_client(app, backend_response) as client:
        response = client.delete('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


def test_delete_report_backend_error(app):
    backend_response = {'result': False}
    with get_mocked_client(app, backend_response) as client:
        response = client.delete('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete report'
