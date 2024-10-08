import { it, expect } from 'vitest';
import { ErrorHTTP, customErrorHTTP } from '../src';

it('ErrorHTTP', () => {
  const defaultErrorHTTP = new ErrorHTTP();
  expect(defaultErrorHTTP.status).toBe(500);
  expect(defaultErrorHTTP.message).toBe('Internal Server Error');
  expect(defaultErrorHTTP.stack).toContain('Error: Internal Server Error');

  const statusAsMessage = new ErrorHTTP(404);
  expect(statusAsMessage.status).toBe(404);
  expect(statusAsMessage.message).toBe('Not Found');
  expect(statusAsMessage.stack).toContain('Error: Not Found');

  const messageAndStatus = new ErrorHTTP('Wrongo', 401);
  expect(messageAndStatus.status).toBe(401);
  expect(messageAndStatus.message).toBe('Wrongo');
  expect(messageAndStatus.stack).toContain('Error: Wrongo');

  const unknownCode = new ErrorHTTP(999);
  expect(unknownCode.status).toBe(999);
  expect(unknownCode.message).toBe('Unknown status 999');
  expect(unknownCode.stack).toContain('Error: Unknown status 999');
});

it('customErrorHTTP', () => {
  expect(() => {
    (customErrorHTTP as any)();
  }).toThrowError(/code is required to be a string or number/);
  expect(() => {
    (customErrorHTTP as any)(function() {});
  }).toThrowError(/code is required to be a string or number/);

  const CustomErrorType = customErrorHTTP('MyCustomErrorTypeCode', 401);
  const defaultErrorHTTP = new CustomErrorType();
  expect(defaultErrorHTTP.code).toBe('MyCustomErrorTypeCode');
  expect(defaultErrorHTTP.status).toBe(401);
  expect(defaultErrorHTTP.message).toBe('Unauthorized');
  expect(defaultErrorHTTP.stack).toContain('Error: Unauthorized');

  // @ts-ignore
  const statusAsMessage = new CustomErrorType(404);
  expect(statusAsMessage.code).toBe('MyCustomErrorTypeCode');
  expect(statusAsMessage.status).toBe(401);
  expect(statusAsMessage.message).toBe('404');
  expect(defaultErrorHTTP.stack).toContain('Error: Unauthorized');

  const messageErrorHTTP = new CustomErrorType('something custom happened');
  expect(messageErrorHTTP.code).toBe('MyCustomErrorTypeCode');
  expect(messageErrorHTTP.status).toBe(401);
  expect(messageErrorHTTP.message).toBe('something custom happened');
  expect(messageErrorHTTP.stack).toContain('Error: something custom happened');

  const ServerError = customErrorHTTP('CustomServerError');
  const defaultServerError = new ServerError();
  expect(defaultServerError.code).toBe('CustomServerError');
  expect(defaultServerError.status).toBe(500);
  expect(defaultServerError.message).toBe('Internal Server Error');
  expect(defaultServerError.stack).toContain('Error: Internal Server Error');

  const messaageServerError = new ServerError('[%s:%s:%s] bar', 'foo', 'baz', 'bang');
  expect(messaageServerError.code).toBe('CustomServerError');
  expect(messaageServerError.status).toBe(500);
  expect(messaageServerError.message).toBe('[foo:baz:bang] bar');
  expect(messaageServerError.stack).toContain('Error: [foo:baz:bang] bar');

  const NumericCode = customErrorHTTP(400);
  const numericErrorCode = new NumericCode();
  expect(numericErrorCode.code).toBe(400);
  expect(numericErrorCode.status).toBe(500);
  expect(numericErrorCode.message).toBe('Internal Server Error');
  expect(numericErrorCode.stack).toContain('Error: Internal Server Error');
});