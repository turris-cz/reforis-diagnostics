/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, getByText, fireEvent, wait } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { AlertContext } from "foris";

import ReportsTable from "../ReportsTable";

describe("<ReportsTable />", () => {
    const handleReload = jest.fn(),
        setAlert = jest.fn();

    function createTable(reports) {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <ReportsTable reports={reports} onReload={handleReload} />
            </AlertContext.Provider>
        );
        return container;
    }

    it("should render reports", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}])
        expect(container).toMatchSnapshot();
    });

    it("should handle lack of reports", async () => {
        const container = createTable([])
        expect(container).toMatchSnapshot();
    });

    it("should display spinner when report is not ready", async () => {
        const container = createTable([{diag_id: 1234, status: "pending"}])
        expect(container).toMatchSnapshot();

        // Intial check for status
        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/reports/1234", expect.anything());
        mockAxios.mockResponse({data: {diag_id: 1234, status: "pending"}});
        // Repeated check for status
        await wait(
            () => expect(mockAxios.get).nthCalledWith(2, "/reforis/diagnostics/api/reports/1234", expect.anything())
        );
        mockAxios.mockResponse({data: {diag_id: 1234, status: "ready"}});
        await wait(() => expect(handleReload).toBeCalledTimes(1));
    });

    it("should handle error on fetching reports", async () => {
        createTable([{diag_id: 1234, status: "pending"}])
        mockAxios.mockError({response: {}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot fetch report data");
        });
    });

    it("should delete report", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}])
        fireEvent.click(getByText(container, "Delete"));
        expect(mockAxios.delete).toHaveBeenCalledWith("/reforis/diagnostics/api/reports/1234", expect.anything());
        // Response to DELETE report
        mockAxios.mockResponse({});
        await wait(() => expect(handleReload).toBeCalledTimes(1));
    });

    it("should handle delete error", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}])
        fireEvent.click(getByText(container, "Delete"));
        // Response to DELETE report
        mockAxios.mockError({response: {headers: {"content-type": "application/json"}}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot delete report");
        });
    });
});
