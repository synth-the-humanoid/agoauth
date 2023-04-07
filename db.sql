CREATE DATABASE AgoAuth;
USE AgoAuth;

CREATE TABLE Requests (
    RequestID VARCHAR(64),
    IPAddress INT UNSIGNED NOT NULL,
    CreationTimestamp DATETIME NOT NULL,
    APIEndpoint VARCHAR(64) NOT NULL,
    PRIMARY KEY (RequestID)
);

CREATE TABLE EmailCodes (
    CodeID VARCHAR(64),
    EmailCode VARCHAR(8) NOT NULL,
    RequestID VARCHAR(64),
    EmailAddress VARCHAR(64) NOT NULL,
    PRIMARY KEY (CodeID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID)
);

CREATE TABLE EmailVerifications (
    CodeID VARCHAR(64),
    RequestID VARCHAR(64),
    FOREIGN KEY (CodeID) REFERENCES EmailCodes(CodeID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID)
);

CREATE TABLE Users (
    UserID VARCHAR(64),
    RequestID VARCHAR(64),
    PRIMARY KEY (UserID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID)
);

CREATE TABLE EmailUpdates (
    UserID VARCHAR(64),
    RequestID VARCHAR(64),
    CodeID VARCHAR(64),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (CodeID) REFERENCES EmailVerifications(CodeID)
);

CREATE TABLE HashUpdates (
    UserID VARCHAR(64),
    RequestID VARCHAR(64),
    UserHash VARCHAR(64) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID)
);

CREATE TABLE Tokens (
    TokenID VARCHAR(64),
    UserID VARCHAR(64),
    RequestID VARCHAR(64),
    PRIMARY KEY (TokenID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID)
);

CREATE TABLE AccessRoles (
    RoleID VARCHAR(64),
    RoleName VARCHAR(64) NOT NULL UNIQUE,
    PRIMARY KEY (RoleID)
);

CREATE TABLE RoleAssignments (
    RoleID VARCHAR(64),
    RequestID VARCHAR(64),
    UserID VARCHAR(64),
    TokenID VARCHAR(64),
    IsEnabled BOOLEAN NOT NULL,
    FOREIGN KEY (RoleID) REFERENCES AccessRoles(RoleID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (TokenID) REFERENCES Tokens(TokenID)
);

CREATE TABLE APIKeys (
    KeyID VARCHAR(64),
    RequestID VARCHAR(64),
    UserID VARCHAR(64),
    LoginKey VARCHAR(64) NOT NULL,
    CallbackURL VARCHAR(64) NOT NULL,
    PRIMARY KEY (UserID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE APIApprovals (
    ApprovalID VARCHAR(64),
    KeyID VARCHAR(64),
    RequestID VARCHAR(64),
    UserID VARCHAR(64),
    ExternUserID VARCHAR(64) NOT NULL,
    PRIMARY KEY (ApprovalID),
    FOREIGN KEY (KeyID) REFERENCES APIKeys(KeyID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE APIRevocations (
    ApprovalID VARCHAR(64),
    RequestID VARCHAR(64),
    TokenID VARCHAR(64),
    FOREIGN KEY (ApprovalID) REFERENCES APIApprovals(ApprovalID),
    FOREIGN KEY (RequestID) REFERENCES Requests(RequestID),
    FOREIGN KEY (TokenID) REFERENCES Tokens(TokenID)
);