/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React, { useEffect } from "react";

import { useAPIGet, withSpinnerOnSending, withErrorMessage } from "foris";

import API_URLs from "API";

import Modules from "./Modules";
import ReportsTable from "./ReportsTable";

export default function Diagnostics() {
    const [getReportsResponse, getReports] = useAPIGet(API_URLs.reports);
    useEffect(() => {
        getReports();
    }, [getReports]);

    return (
        <>
            <h1>{_("Diagnostics")}</h1>
            <p>
                {_(
                    "Generate a diagnostics report to simplify debugging some problems related to the router's functionality."
                )}
            </p>
            <div className="card p-4 mb-3">
                <Modules onReload={getReports} />
                <h2>{_("Reports")}</h2>
                <ReportsTableWithErrorAndSpinner
                    apiState={getReportsResponse.state}
                    reports={getReportsResponse.data}
                    onReload={getReports}
                />
            </div>
        </>
    );
}

const ReportsTableWithErrorAndSpinner = withSpinnerOnSending(
    withErrorMessage(ReportsTable)
);
