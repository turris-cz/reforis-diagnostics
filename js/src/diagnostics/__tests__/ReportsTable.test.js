/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    render,
    getByText,
    fireEvent,
    wait,
    waitForElement,
    getByTestId,
    act
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from 'jest-mock-axios';

import ReportsTable from "../ReportsTable";

describe("<ReportsTable />", () => {
    const handleReload = jest.fn();

    function createTable(reports) {
        const { container } = render(<ReportsTable reports={reports} onReload={handleReload} />);
        return container;
    }

    it("should render reports", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}]);
        await waitForElement(() => getByTestId(container, "reports-table"));
        expect(container).toMatchSnapshot();
    });

    it("should handle lack of reports", async () => {
        const container = createTable([]);
        expect(container).toMatchSnapshot();
    });

    it("should display spinner when report is not ready", async () => {
        const container = createTable([{diag_id: 1234, status: "pending"}]);
        await waitForElement(() => getByTestId(container, "reports-table"));

        expect(container).toMatchSnapshot();

        await wait(
            () => expect(mockAxios.get).toBeCalledWith( "/reforis/diagnostics/api/reports/1234", expect.anything())
        );
        await waitForElement(() => getByTestId(container, "reports-table"));

        await act(async ()=>{
            mockAxios.mockResponse({data: {diag_id: 1234, status: "ready"}});
        });
    });

    it("should handle error on fetching reports", async () => {
        const container = createTable([{diag_id: 1234, status: "pending"}]);
        await wait(
            () => expect(mockAxios.get).toBeCalledWith( "/reforis/diagnostics/api/reports/1234", expect.anything())
        );
        act(()=>mockJSONError());
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith("Cannot fetch report data.");
        });
    });

    it("should delete report", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}]);
        const deleteButton = await waitForElement(()=> getByText(container, "Delete"));
        fireEvent.click(deleteButton);
        expect(mockAxios.delete).toHaveBeenCalledWith("/reforis/diagnostics/api/reports/1234", expect.anything());
        // Response to DELETE report
        mockAxios.mockResponse({});
        await wait(() => expect(handleReload).toBeCalledTimes(1));
    });

    it("should handle delete error", async () => {
        const container = createTable([{diag_id: 1234, status: "ready"}]);
        const deleteButton = await waitForElement(()=> getByText(container, "Delete"));
        fireEvent.click(deleteButton);
        // Response to DELETE report
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith("Cannot delete report.");
        });
    });
});
