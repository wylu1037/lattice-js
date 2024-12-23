export enum Codes {
  // 0 is returned on success.
  OK = 0,
  Canceled = 1,
  Unknown = 2,
  InvalidArgument = 3,
  DeadlineExceeded = 4,
  NotFound = 5,
  AlreadyExists = 6,
  PermissionDenied = 7,
  ResourceExhausted = 8,
  FailedPrecondition = 9,
  Aborted = 10,
  OutOfRange = 11,
  Unimplemented = 12,
  Internal = 13,
  Unavailable = 14,
  DataLoss = 15,
  Unauthenticated = 16,
  _maxCode = 17,
}

const codeMessages: Record<Codes, string> = {
  [Codes.OK]: "OK",
  [Codes.Canceled]: "Canceled",
  [Codes.Unknown]: "Unknown",
  [Codes.InvalidArgument]: "Invalid argument",
  [Codes.DeadlineExceeded]: "Deadline exceeded",
  [Codes.NotFound]: "Not found",
  [Codes.AlreadyExists]: "Already exists",
  [Codes.PermissionDenied]: "Permission denied",
  [Codes.ResourceExhausted]: "Resource exhausted",
  [Codes.FailedPrecondition]: "Failed precondition",
  [Codes.Aborted]: "Aborted",
  [Codes.OutOfRange]: "Out of range",
  [Codes.Unimplemented]: "Unimplemented",
  [Codes.Internal]: "Internal",
  [Codes.Unavailable]: "Unavailable",
  [Codes.DataLoss]: "Data loss",
  [Codes.Unauthenticated]: "Unauthenticated",
  [Codes._maxCode]: "Oh no!",
};

export interface LatticeError {
  code: Codes;
  message: string;
  details?: any;
}

// inspired by grpc-js
class Status extends Error implements LatticeError {
  code: Codes;
  message: string;
  details?: any;

  constructor(code: Codes, message?: string, details?: any) {
    super(message ?? codeMessages[code]);
    this.code = code;
    this.message = message ?? codeMessages[code];
    this.details = details;
    // Object.setPrototypeOf(this, Status.prototype);
  }

  static ok(message?: string): Status {
    return new Status(Codes.OK, message ?? codeMessages[Codes.OK]);
  }

  static error(code: Codes, message?: string): Status {
    return new Status(code, message ?? codeMessages[code]);
  }
}
