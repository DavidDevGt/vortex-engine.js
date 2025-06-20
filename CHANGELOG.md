# Changelog

All notable changes to VortexEngine will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-06-20

### Added
- Initial release of VortexEngine
- Reactive state management with Proxy-based reactivity
- Core directives: `vx-bind`, `vx-show`, `vx-if`, `vx-for`, `vx-model`, `vx-on`
- Secure expression parser (no eval usage)
- Computed properties support
- Two-way data binding
- Event handling system
- Comprehensive documentation with examples
- Todo application example
- Counter application example
- Multi-language documentation (EN, ES, FR)

### Changed
- Renamed from VortexJS to VortexEngine to avoid naming conflicts
- Reorganized project structure to follow standard distribution layout
- Updated all examples and documentation to use VortexEngine naming

### Technical Details
- Bundle size: ~2KB minified + gzipped
- Zero dependencies
- ES5+ compatible
- Browser and Node.js support
