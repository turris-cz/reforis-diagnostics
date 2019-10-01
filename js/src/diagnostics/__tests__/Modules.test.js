/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";
import { render, waitForElement, getByText, getByLabelText, fireEvent, wait } from "customTestRender";
import mockAxios from 'jest-mock-axios';

import { AlertContext } from "foris";

import Modules from "../Modules";

describe("<Modules />", () => {
    let componentContainer;
    const modules = ["foo_module", "bar_module", "fizz_module", "buzz_module"];
    const handleReload = jest.fn(),
        setAlert = jest.fn();

    beforeEach(() => {
        const { container } = render(
            <AlertContext.Provider value={setAlert}>
                <Modules onReload={handleReload} />
            </AlertContext.Provider>
        );
        componentContainer = container;
    });

    it("should display spinner", async () => {
        expect(componentContainer).toMatchSnapshot();
    });

    it("should render modules", async () => {
        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        mockAxios.mockResponse({data: {modules: modules}});
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should handle error on fetching modules", async () => {
        expect(mockAxios.get).toBeCalledWith("/reforis/diagnostics/api/modules", expect.anything());
        mockAxios.mockError({response: {}});
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(componentContainer).toMatchSnapshot();
    });

    it("should select all modules", async () => {
        mockAxios.mockResponse({data: {modules: modules}});
        await waitForElement(() => getByText(componentContainer, "Modules"));

        // Default state - all unselected and button disabled
        expect(getByText(componentContainer, "Generate report").disabled).toBe(true);
        modules.forEach((module) => {
            expect(getByLabelText(componentContainer, module).checked).toBe(false);
        });

        // All selected, button enabled
        fireEvent.click(getByText(componentContainer, "Select all"));
        expect(getByText(componentContainer, "Generate report").disabled).toBe(false);
        modules.forEach((module) => {
            expect(getByLabelText(componentContainer, module).checked).toBe(true);
        });
    });

    it("should generate report", async () => {
        mockAxios.mockResponse({data: {modules: modules}});
        await waitForElement(() => getByText(componentContainer, "Modules"));

        fireEvent.click(getByText(componentContainer, modules[0]));
        fireEvent.click(getByText(componentContainer, "Generate report"));
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/diagnostics/api/reports", {modules: [modules[0]]}, expect.anything()
        );

        // Response to POST report
        mockAxios.mockResponse({data: {}});
        await waitForElement(() => getByText(componentContainer, "Modules"));
        expect(handleReload).toHaveBeenCalledTimes(1);
    });

    it("should handle error on generating report", async () => {
        mockAxios.mockResponse({data: {modules: modules}});
        await waitForElement(() => getByText(componentContainer, "Modules"));

        fireEvent.click(getByText(componentContainer, modules[0]));
        fireEvent.click(getByText(componentContainer, "Generate report"));
        expect(mockAxios.post).toBeCalledWith(
            "/reforis/diagnostics/api/reports", {modules: [modules[0]]}, expect.anything()
        );

        // Response to POST report
        mockAxios.mockError({response: {headers: {"content-type": "application/json"}}});
        await wait(() => {
            expect(setAlert).toHaveBeenCalledWith("Cannot generate report");
        });
    });
});
