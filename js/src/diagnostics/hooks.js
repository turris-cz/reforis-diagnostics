/*
 * Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import { useEffect, useState } from "react";

import {
    API_STATE, useAlert, useAPIDelete, useAPIPolling,
} from "foris";
import API_URLs from "../API";

const REPORT_REFRESH_INTERVAL = 700; // milliseconds

const REPORT_STATES = {
    ready: "ready",
};

export function useReportIsReady(report) {
    const [setAlert] = useAlert();

    const [reportIsReady, setReportIsReady] = useState(false);
    // Initial check for "ready" status.
    useEffect(() => {
        setReportIsReady(report.status === REPORT_STATES.ready);
    }, [report]);

    // Repeatedly check status until it's "ready".
    const [reportState] = useAPIPolling(
        `${API_URLs.reports}/${report.diag_id}`,
        REPORT_REFRESH_INTERVAL,
        !reportIsReady,
    );

    useEffect(() => {
        if (reportState.state === API_STATE.SUCCESS) {
            setReportIsReady(reportState.data.status === REPORT_STATES.ready);
        } else if (reportState.state === API_STATE.ERROR) {
            setAlert(_("Cannot fetch report data."));
        }
    }, [reportState, setReportIsReady, setAlert]);

    return reportIsReady;
}

export function useDeleteReport(reportId, onReload) {
    const [setAlert] = useAlert();

    const [deleteReportResponse, deleteReport] = useAPIDelete(`${API_URLs.reports}/${reportId}`);
    useEffect(() => {
        if (deleteReportResponse.state === API_STATE.SUCCESS) {
            onReload();
        } else if (deleteReportResponse.state === API_STATE.ERROR) {
            setAlert(_("Cannot delete report."));
        }
    }, [deleteReportResponse, onReload, setAlert]);

    return deleteReport;
}
