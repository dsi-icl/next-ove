# pjlink-control

Power:
- Commands:
  - power on: %1POWR 1\r
    - Responses:
      - OK: %1POWR=OK\r
      - OOP: %1POWR=ERR2\r
      - UT: %1POWR=ERR3\r
      - PDF: %1POWR=ERR4\r
  - power off: %1POWR 0\r
    - Responses:
      - OK: %1POWR=OK\r
      - OOP: %1POWR=ERR2\r
      - UT: %1POWR=ERR3\r
      - PDF: %1POWR=ERR4\r
  - get power: %1POWR ?\r
    - Responses:
      - Off: %1POWR=0\r
      - On: %1POWR=1\r
      - On->Off: %1POWR=2\r
      - Off->On: %1POWR=3\r
      - UT: %1POWR=ERR3\r
      - PDF: %1POWR=ERR4\r
  - input rgb: %1INPT 

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test pjlink-control` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint pjlink-control` to execute the lint via [ESLint](https://eslint.org/).
