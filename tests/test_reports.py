#  Copyright (C) 2020 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus
from unittest.mock import mock_open, patch

from reforis.test_utils import mock_backend_response


@mock_backend_response({'diagnostics': {'list_diagnostics': {'diagnostics': []}}})
def test_get_reports(client):
    response = client.get('/diagnostics/api/reports')
    assert response.status_code == HTTPStatus.OK
    assert response.json == []


@mock_backend_response({'diagnostics': {'prepare_diagnostic': {'diag_id': '1234ABCD'}}})
def test_post_reports(client):
    response = client.post(
        '/diagnostics/api/reports',
        json={'modules': ['foobar_module']},
    )
    assert response.status_code == HTTPStatus.ACCEPTED
    assert response.json == {'diag_id': '1234ABCD'}


@mock_backend_response({'diagnostics': {'prepare_diagnostic': {}}})
def test_post_reports_invalid_response(client):
    response = client.post('/diagnostics/api/reports')
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == 'Invalid JSON'


@mock_backend_response({'diagnostics': {'prepare_diagnostic': {}}})
def test_post_reports_missing_data(client):
    response = client.post(
        '/diagnostics/api/reports',
        json={'different_field': 'some_value'},
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'modules': 'Missing data for required field.'}


@mock_backend_response({'diagnostics': {'prepare_diagnostic': {}}})
def test_post_reports_invalid_data(client):
    response = client.post(
        '/diagnostics/api/reports',
        json={'modules': 1234},
    )
    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json == {'modules': 'Expected data of type: list'}


@mock_backend_response({'diagnostics': {'prepare_diagnostic': {'something_else': 'meaningless_value'}}})
def test_post_reports_backend_error(client):
    response = client.post('/diagnostics/api/reports', json={'modules': ['foobar_module']})
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot create diagnostics report'


@mock_backend_response({
    'diagnostics': {
        'list_diagnostics': {
            'diagnostics': [{'diag_id': '1234'}]
        }
    }
})
def test_get_report_meta(client):
    backend_response = {'diagnostics': [{'diag_id': '1234'}]}
    response = client.get('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.OK
    assert response.json == backend_response['diagnostics'][0]


@mock_backend_response({
    'diagnostics': {
        'list_diagnostics': {
            'diagnostics': [{'diag_id': '5678'}]
        }
    }
})
def test_get_report_meta_not_found(client):
    response = client.get('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested report does not exist'


@mock_backend_response({
    'diagnostics': {
        'list_diagnostics': {
            'diagnostics': [
                {'diag_id': '1234', 'status': 'ready', 'path': 'path: /tmp/diagnostics-2019-09-17_c907711c.out'}
            ]
        }
    }
})
def test_get_report_contents(client):
    opener = mock_open(read_data=b'DATA')
    with patch('reforis_diagnostics.open', opener):
        response = client.get('/diagnostics/api/reports/1234/contents')
    assert response.status_code == HTTPStatus.OK
    # Expect to receive some gzipped content
    assert response.data


@mock_backend_response({
    'diagnostics': {
        'list_diagnostics': {
            'diagnostics': [{'diag_id': '5678', 'status': 'pending'}]
        }
    }
})
def test_get_report_contents_not_ready(client):
    response = client.get('/diagnostics/api/reports/5678/contents')
    assert response.status_code == HTTPStatus.CONFLICT
    assert response.json == 'Requested report is not ready yet'


@mock_backend_response({
    'diagnostics': {
        'list_diagnostics': {'diagnostics': [{'diag_id': '5678'}]}
    }
})
def test_get_report_contents_not_found(client):
    response = client.get('/diagnostics/api/reports/1234/contents')
    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json == 'Requested report does not exist'


@mock_backend_response({'diagnostics': {'remove_diagnostic': {'result': True}}})
def test_delete_report(client):
    response = client.delete('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.NO_CONTENT


@mock_backend_response({'diagnostics': {'remove_diagnostic': {'result': False}}})
def test_delete_report_backend_error(client):
    response = client.delete('/diagnostics/api/reports/1234')
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json == 'Cannot delete report'
