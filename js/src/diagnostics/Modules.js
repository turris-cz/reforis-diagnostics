import React, { useEffect } from "react";
import PropTypes from "prop-types";

import {
    Button,
    CheckBox,
    formFieldsSize,
    Spinner,
    useAPIGet,
    useAPIPost,
    useForm,
    useAlert,
    API_STATE,
} from "foris";

import API_URLs from "API";

// Has to be defined outside component as it would cause re-renders
function bypassValidator() {
    return {};
}

Modules.propTypes = {
    onReload: PropTypes.func.isRequired,
};

export default function Modules({ onReload }) {
    const [getModulesResponse, getModules] = useAPIGet(API_URLs.modules);
    useEffect(() => {
        getModules();
    }, [getModules]);

    const [formState, setFormValue] = useForm(bypassValidator);
    const formData = formState.data;
    useEffect(() => {
        if (getModulesResponse.state === API_STATE.SUCCESS) {
            const modules = getModulesResponse.data.modules.reduce(
                (modulesAccumulator, module) => {
                    modulesAccumulator[module] = false;
                    return modulesAccumulator;
                },
                {},
            );
            setFormValue((value) => ({ $set: { modules: value } }))({ target: { value: modules } });
        }
    }, [getModulesResponse, setFormValue]);

    let modulesElement;
    if (getModulesResponse.state === API_STATE.ERROR) {
        modulesElement = <p className="text-center text-danger">{_("An error occurred during loading modules")}</p>;
    } else if (!formData) {
        modulesElement = <Spinner className="my-3 text-center" />;
    } else {
        modulesElement = (
            <ModulesForm
                onReload={onReload}
                modules={formData.modules}
                setFormValue={setFormValue}
            />
        );
    }

    return (
        <>
            <h3>{_("Modules")}</h3>
            {modulesElement}
        </>
    );
}

ModulesForm.propTypes = {
    onReload: PropTypes.func.isRequired,
    modules: PropTypes.object.isRequired,
    setFormValue: PropTypes.func.isRequired,
};

function ModulesForm({ onReload, modules, setFormValue }) {
    const [setAlert] = useAlert();

    const [postReportResponse, postReport] = useAPIPost(API_URLs.reports);
    useEffect(() => {
        if (postReportResponse.state === API_STATE.SUCCESS) {
            onReload();
        } else if (postReportResponse.state === API_STATE.ERROR) {
            setAlert(_("Cannot generate report"));
        }
    }, [onReload, postReportResponse, setAlert]);

    const selectedModules = Object.keys(modules)
        .filter((moduleName) => modules[moduleName]);

    function generateReport(event) {
        event.preventDefault();
        postReport({ modules: selectedModules });
    }

    const checkboxes = (
        <div className="row">
            {Object.keys(modules)
                .map((name) => (
                    <div key={name} className="col-sm-12 col-md-6 col-lg-4">
                        <CheckBox
                            label={name}
                            checked={modules[name]}
                            useDefaultSize={false}
                            onChange={
                                setFormValue((value) => ({ modules: { [name]: { $set: value } } }))
                            }
                        />
                    </div>
                ))}
        </div>
    );

    return (
        <>
            <p>{_("Select modules which you want to include in the report.")}</p>
            <form onSubmit={generateReport} className={formFieldsSize}>
                <div style={{ fontWeight: "bold" }}>
                    <CheckBox
                        label={_("Select all")}
                        checked={Object.keys(modules)
                            .every((name) => modules[name] === true)}
                        useDefaultSize={false}
                        onChange={setFormValue(
                            (value) => ({ modules: updateAllValues(modules, value) }),
                        )}
                    />
                </div>
                {checkboxes}
                <Button
                    type="submit"
                    disabled={!selectedModules.length}
                    forisFormSize
                >
                    {_("Generate report")}
                </Button>
            </form>
        </>
    );
}

// Return rules for immutability-helper to set every key to passed value
function updateAllValues(objectToUpdate, value) {
    const updateRules = { ...objectToUpdate };
    Object.keys(updateRules)
        .forEach((moduleName) => {
            updateRules[moduleName] = { $set: value };
        });
    return updateRules;
}
