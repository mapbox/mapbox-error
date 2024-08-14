# Changelog

## 4.0.0

* Convert to typescript, module is still delivered as CommonJS
* Remove the fastlog default dependency and use `console.error` instead
* Remove `showErrorWithOptions` function, replaced with simply `showError` which is a function
* Modify `notFound` to be a function that returns a middleware function
* Remove CircleCI and use GitHub Actions

## 3.1.0

* Allows providing a custom logger for the showError middleware

## 3.0.3

* Updated `@mapbox/fastlog` to version `1.3.3`, because the previous versions have an upstream dependency to vulnerable version of `minimist`.

## 3.0.2

* Changed `fastlog` to private version `@mapbox/fastlog` and updated version to more recent one, which has no upstream dependency to vulnerable version of `underscore`.

## 3.0.1

* Fixed regression in `showError` handler

## 3.0.0

* es6 support, move to @mapbox namespace on npm [#16](https://github.com/mapbox/mapbox-error/pull/16)
