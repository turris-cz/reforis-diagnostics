#  Copyright (C) 2020-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

from http import HTTPStatus

from reforis.test_utils import mock_backend_response


@mock_backend_response({"diagnostics": {"list_modules": ["1", "2"]}})
def test_get_modules(client):
    response = client.get("/diagnostics/api/modules")
    assert response.status_code == HTTPStatus.OK
    assert response.json == ["1", "2"]
