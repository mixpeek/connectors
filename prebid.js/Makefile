.PHONY: help install build test lint clean example docs

# Colors
COLOR_RESET   = \033[0m
COLOR_INFO    = \033[36m
COLOR_SUCCESS = \033[32m

help: ## Show this help message
	@echo '$(COLOR_INFO)Mixpeek Context Adapter - Prebid.js$(COLOR_RESET)'
	@echo ''
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(COLOR_SUCCESS)%-15s$(COLOR_RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo '$(COLOR_INFO)Installing dependencies...$(COLOR_RESET)'
	npm install
	@echo '$(COLOR_SUCCESS)✓ Dependencies installed$(COLOR_RESET)'

build: ## Build the adapter
	@echo '$(COLOR_INFO)Building adapter...$(COLOR_RESET)'
	npm run build
	@echo '$(COLOR_SUCCESS)✓ Build complete$(COLOR_RESET)'

build-dev: ## Build in development mode
	@echo '$(COLOR_INFO)Building in development mode...$(COLOR_RESET)'
	npm run build:dev
	@echo '$(COLOR_SUCCESS)✓ Development build complete$(COLOR_RESET)'

test: ## Run tests
	@echo '$(COLOR_INFO)Running tests...$(COLOR_RESET)'
	npm test
	@echo '$(COLOR_SUCCESS)✓ Tests passed$(COLOR_RESET)'

test-watch: ## Run tests in watch mode
	@echo '$(COLOR_INFO)Running tests in watch mode...$(COLOR_RESET)'
	npm run test:watch

test-coverage: ## Run tests with coverage
	@echo '$(COLOR_INFO)Running tests with coverage...$(COLOR_RESET)'
	npm run test:coverage
	@echo '$(COLOR_SUCCESS)✓ Coverage report generated$(COLOR_RESET)'

lint: ## Lint code
	@echo '$(COLOR_INFO)Linting code...$(COLOR_RESET)'
	npm run lint
	@echo '$(COLOR_SUCCESS)✓ Linting complete$(COLOR_RESET)'

lint-fix: ## Lint and fix code
	@echo '$(COLOR_INFO)Linting and fixing code...$(COLOR_RESET)'
	npm run lint:fix
	@echo '$(COLOR_SUCCESS)✓ Code fixed$(COLOR_RESET)'

clean: ## Clean build artifacts
	@echo '$(COLOR_INFO)Cleaning...$(COLOR_RESET)'
	rm -rf dist/ coverage/ node_modules/.cache
	@echo '$(COLOR_SUCCESS)✓ Clean complete$(COLOR_RESET)'

example: ## Run example demo
	@echo '$(COLOR_INFO)Starting example demo...$(COLOR_RESET)'
	@echo 'Navigate to examples/publisher-demo and run: npm start'
	cd examples/publisher-demo && npm install && npm start

docs: ## Generate documentation
	@echo '$(COLOR_INFO)Generating documentation...$(COLOR_RESET)'
	npm run docs
	@echo '$(COLOR_SUCCESS)✓ Documentation generated$(COLOR_RESET)'

all: clean install build test ## Clean, install, build, and test

ci: install lint test build ## Run CI pipeline

.DEFAULT_GOAL := help

