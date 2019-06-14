#  Copyright (C) 2019 CZ.NIC z.s.p.o. (http://www.nic.cz/)
#
#  This is free software, licensed under the GNU General Public License v3.
#  See /LICENSE for more information.

.PHONY: all prepare-dev install lint test clean

DEV_PYTHON=python3.7

all:
	@echo "make lint"
	@echo "    Run list on project."
	@echo "make install"
	@echo "    Install package in your system (for running on router)."
	@echo "make create-messages"
	@echo "    Create locale messages (.pot)."
	@echo "make update-messages"
	@echo "    Update locale messages from .pot file."
	@echo "make compile-messages"
	@echo "    Compile locale messager."
	@echo "make clean"
	@echo "    Remove python artifacts and virtualenv."

install:
	$(ROUTER_PYTHON) -m pip install -e .

create-messages:
	$(VENV_BIN)/pybabel extract -F babel.cfg -o ./reforis/translations/messages.pot .
update-messages:
	$(VENV_BIN)/pybabel update -i ./reforis/translations/messages.pot -d ./reforis/translations
	$(VENV_BIN)/pybabel update -i ./reforis/translations/tzinfo.pot -d ./reforis/translations -D tzinfo
compile-messages:
	$(VENV_BIN)/pybabel compile -f -d ./reforis/translations
	$(VENV_BIN)/pybabel compile -f -d ./reforis/translations -D tzinfo

clean:
	find . -name '*.pyc' -exec rm -f {} +
	rm -rf $(VENV_NAME) *.eggs *.egg-info dist build docs/_build .cache
	rm -rf dist build *.egg-info
	$(ROUTER_PYTHON) -m pip uninstall -y reforis_diagnostics
