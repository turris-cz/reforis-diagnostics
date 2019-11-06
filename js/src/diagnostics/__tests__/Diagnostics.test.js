/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render, waitForElement, waitForElementToBeRemoved, fireEvent, getByText, getByTestId
} from "foris/testUtils/customTestRender";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from 'jest-mock-axios';

import Diagnostics from "../Diagnostics";

describe("<Diagnostics />", () => {
    let componentContainer;

    beforeEach(() => {
        const { container } = render(<Diagnostics />);
        componentContainer = container;
    });

    it("should render modules and reports", async () => {
        expect(getByText(componentContainer, "Diagnostics")).toBeDefined();

        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        // Response to GET modules
        mockAxios.mockResponse({data: {modules: ["foobar_module"]}});

        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/reports", expect.anything());
        // Response to GET reports
        mockAxios.mockResponse({data: [{diag_id: "1234", path: "/tmp/1234", status: "ready"}]});

        await waitForElement(() => getByText(componentContainer, "Reports"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle error on loading reports", async () => {
        expect(getByText(componentContainer, "Diagnostics")).toBeDefined();

        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        // Response to GET modules
        mockAxios.mockResponse({data: {modules: ["foobar_module"]}});

        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/reports", expect.anything());
        // Response to GET reports
        mockJSONError();

        await waitForElement(() => getByText(componentContainer, "Reports"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should reload reports table when new report is generated", async () => {
        // Load initial data
        mockAxios.mockResponse({data: {modules: ["foobar_module"]}});
        mockAxios.mockResponse({data: [{diag_id: "1234", path: "/tmp/1234", status: "ready"}]});
        await waitForElement(() => getByText(componentContainer, "Reports"));

        // Generate new report
        fireEvent.click(getByText(componentContainer, "foobar_module"));
        fireEvent.click(getByText(componentContainer, "Generate report"));

        expect(mockAxios.post).toBeCalledWith(
            "/reforis/diagnostics/api/reports", {modules: ["foobar_module"]}, expect.anything()
        );
        // Response to POST reports
        mockAxios.mockResponse({data: {diag_id: "5678"}});

        // Spinner appears
        await waitForElementToBeRemoved(() => getByTestId(componentContainer, "reports-table"));

        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/reports", expect.anything());
        // Response to GET reports
        mockAxios.mockResponse({data: [{diag_id: "1234", path: "/tmp/1234", status: "ready"}, {diag_id: "5678", path: "/tmp/5678", status: "ready"}]});

        // New report appears
        await waitForElement(() => getByText(componentContainer, "5678"));
        expect(componentContainer).toMatchSnapshot();
    });
});
