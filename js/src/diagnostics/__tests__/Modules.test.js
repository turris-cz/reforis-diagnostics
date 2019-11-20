/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import {
    fireEvent,
    getByText,
    getByLabelText,
    render,
    wait,
    waitForElement
} from "foris/testUtils/customTestRender";
import { mockSetAlert } from "foris/testUtils/alertContextMock";
import { mockJSONError } from "foris/testUtils/network";
import mockAxios from "jest-mock-axios";

import Modules from "../Modules";

describe("<Modules />", () => {
    let componentContainer;
    const modules = [
        {module_id: "foo_module", description:"Boo module description."},
        {module_id: "bar_module", description:"Bar module description."},
        {module_id: "fizz_module", description:"Fizz module description."},
        {module_id: "buzz_module", description: "Buzz module description."},
    ];
    const handleReload = jest.fn();

    beforeEach(() => {
        const { container } = render(<Modules onReload={handleReload}/>);
        componentContainer = container;
    });

    it("should display spinner", async () => {
        expect(componentContainer)
            .toMatchSnapshot();
    });

    it("should render modules", async () => {
        expect(mockAxios.get)
            .toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        mockAxios.mockResponse({ data: { modules: modules } });
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(componentContainer)
            .toMatchSnapshot();
    });

    it("should handle error on fetching modules", async () => {
        expect(mockAxios.get)
            .toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        mockJSONError();
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(componentContainer)
            .toMatchSnapshot();
    });

    it("should select all modules", async () => {
        mockAxios.mockResponse({ data: { modules: modules } });
        await waitForElement(() => getByText(componentContainer, "Modules"));

        // Default state - all unselected and button disabled
        expect(getByText(componentContainer, "Generate report").disabled).toBe(true);
        modules.forEach((module) => {
            expect(getByText(componentContainer, module.module_id).previousSibling.checked).toBe(false);
        });

        // All selected, button enabled
        fireEvent.click(getByText(componentContainer, "Select all"));
        expect(getByText(componentContainer, "Generate report").disabled).toBe(false);
        modules.forEach((module) => {
            expect(getByText(componentContainer, module.module_id).previousSibling.checked).toBe(true);
        });
    });

    it("should generate report", async () => {
        mockAxios.mockResponse({ data: { modules: modules } });
        await waitForElement(() => getByText(componentContainer, "Modules"));

        fireEvent.click(getByText(componentContainer, modules[0].module_id));
        fireEvent.click(getByText(componentContainer, "Generate report"));
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/diagnostics/api/reports", {modules: [modules[0].module_id]}, expect.anything()
        );

        // Response to POST report
        mockAxios.mockResponse({ data: {} });
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(handleReload).toHaveBeenCalledTimes(1);
    });

    it("should handle error on generating report", async () => {
        mockAxios.mockResponse({ data: { modules: modules } });
        await waitForElement(() => getByText(componentContainer, "Modules"));

        fireEvent.click(getByText(componentContainer, modules[0].module_id));
        fireEvent.click(getByText(componentContainer, "Generate report"));
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/diagnostics/api/reports", {modules: [modules[0].module_id]}, expect.anything()
        );

        // Response to POST report
        mockJSONError();
        await wait(() => {
            expect(mockSetAlert).toHaveBeenCalledWith("Cannot generate report");
        });
    });
});
