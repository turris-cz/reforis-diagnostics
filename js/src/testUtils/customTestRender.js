/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import { UIDReset } from "react-uid";
import { render } from "@testing-library/react";

function Wrapper({ children }) {
    return (
        <UIDReset>
            {children}
        </UIDReset>
    );
}

const customTestRender = (ui, options) => render(ui, { wrapper: Wrapper, ...options });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customTestRender as render };
