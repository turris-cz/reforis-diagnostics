/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import Diagnostics from "./diagnostics/Diagnostics";

const DiagnosticsPlugin = {
    name: _("Diagnostics"),
    submenuId: "administration",
    weight: 100,
    path: "/diagnostics",
    component: Diagnostics,
};

ForisPlugins.push(DiagnosticsPlugin);
