/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

import React from "react";

import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, DownloadButton, SpinnerElement } from "foris";
import PropTypes from "prop-types";

import API_URLs from "API";

import { useDeleteReport, useReportIsReady } from "./hooks";

ReportsTable.propTypes = {
    reports: PropTypes.array.isRequired,
    onReload: PropTypes.func.isRequired,
};

export default function ReportsTable({ reports, onReload }) {
    if (reports.length === 0) {
        return (
            <p className="text-muted text-center">
                {_("There are no reports available.")}
            </p>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover" data-testid="reports-table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col">{_("ID")}</th>
                        <th scope="col" aria-label={_("Actions")} />
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <ReportRow
                            key={report.diag_id}
                            report={report}
                            onReload={onReload}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

ReportRow.propTypes = {
    report: PropTypes.object.isRequired,
    onReload: PropTypes.func.isRequired,
};

function ReportRow({ report, onReload }) {
    return (
        <tr>
            <td className="align-middle text-nowrap">{report.diag_id}</td>
            <td className="text-end">
                <ReportActions report={report} onReload={onReload} />
            </td>
        </tr>
    );
}

ReportActions.propTypes = {
    report: PropTypes.shape({
        diag_id: PropTypes.string.isRequired,
    }),
    onReload: PropTypes.func.isRequired,
};

function ReportActions({ report, onReload }) {
    const isReady = useReportIsReady(report);
    const deleteReport = useDeleteReport(report.diag_id, onReload);

    if (!isReady) {
        return <SpinnerElement small className="text-primary" />;
    }

    return (
        <div className="btn-group btn-group-sm text-nowrap" role="group">
            <DownloadButton
                href={`${API_URLs.reports}/${report.diag_id}/contents`}
            >
                <FontAwesomeIcon icon={faDownload} className="fa-sm me-1" />
                {_("Download")}
            </DownloadButton>
            <Button onClick={deleteReport} className="btn-danger btn-sm">
                <FontAwesomeIcon icon={faTrash} className="fa-sm me-1" />
                {_("Delete")}
            </Button>
        </div>
    );
}
