# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2024-07-01

### Changed

-   Updated .gitignore file to exclude Ruff cache folder
-   Updated dependencies in package.json
-   Updated Foris JS library to v6.0.2
-   NPM audit fix

## [3.0.0] - 2024-03-12

### Added

-   Added & updated Weblate translations
-   Added missing foris-controller module installation
-   Added data-testid to generate report button

### Changed

-   Updated dependencies in package.json
-   Updated Node.js to v21.x in Makefile
-   Updated ESLint and Prettier configurations
-   Updated .gitignore to exclude minified JS files and license files
-   Updated webpack.config.js with process/browser alias
-   Updated CI to use shared scripts, build and publish python package
-   Update SpinnerElement class in ReportsTable.js
-   Replaced Pylint & Pycodestyle for Ruff
-   Restructured and updated Makefile
-   Changed build system to Hatch
-   NPM audit fix

### Removed

-   Removed MANIFEST.in

## [2.5.1] - 2021-03-03

-   Update & create translation messages
-   Update copyright & GitLab links
-   Update Foris JS library to v5.1.9

## [2.5.0] - 2020-09-24

-   Change all modules checked by default
-   Integrate Prettier and format files
-   Restructure headings & add card layout
-   Improve Reports table

## [2.4.0] - 2020-03-27

-   Update ForisJS v4.5.0.
-   NPM audit fix & update packages.

## [2.3.1] - 2020-03-02

-   Update translations.

## [2.3.0] - 2020-02-17

-   Use ForisJS 3.4.0.
-   Small UI/UX improvements.
-   Improve Makefile.

## [2.2.2] - 2020-01-10

-   Updated foris JS version.
-   Updated python dependencies and API tests.

## [2.2.1] - 2019-11-21

-   Fix js app path.

## [2.2.0] - 2019-11-20

-   Use API polling from forisjs.
-   Use forisjs 1.3.2.
-   Update translations.
-   Use global AlertContext.
-   Add loading and error handlers.
-   Use shared lint config.
-   Add missing copyrights.
-   A lot of small improvements.

## [2.1.0] - 2019-10-22

-   Fix WS closing connection after downloading bug.
-   Use major version of Foris-js.
-   Use common python code with other plugins.

## [2.0.1] - 2019-10-10

-   Fix static path.

## [2.0.0] - 2019-10-08

-   Completely rewritten in JS with the new plugin system.

[unreleased]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v3.1.0...master
[3.1.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v3.0.0...v3.1.0
[3.0.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.5.1...v3.0.0
[2.5.1]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.5.0...v2.5.1
[2.5.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.4.0...v2.5.0
[2.4.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.3.1...v2.4.0
[2.3.1]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.3.0...v2.3.1
[2.3.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.2.2...v2.3.0
[2.2.2]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.2.1...v2.2.2
[2.2.1]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.2.0...v2.2.1
[2.2.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.1.0...v2.2.0
[2.1.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.0.1...v2.1.0
[2.0.1]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/compare/v2.0.0...v2.0.1
[2.0.0]: https://gitlab.nic.cz/turris/reforis/reforis-diagnostics/-/tags/v2.0.0
