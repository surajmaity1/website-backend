import sinon from "sinon";
import cleanDb from "../../utils/cleanDb";
import {
    OOO_STATUS_ALREADY_EXIST,
    REQUEST_ALREADY_PENDING,
    USER_STATUS_NOT_FOUND,
} from "../../../constants/requests";
import { createOOORequest, validateUserStatus } from "../../../services/oooRequest";
import { expect } from "chai";
import { validOooStatusRequests, validUserCurrentStatus } from "../../fixtures/oooRequest/oooRequest";
import { deleteUserStatus, updateUserStatus } from "../../../models/userStatus";
import { userState } from "../../../constants/userStatus";

describe("Test OOO Request Service", function() {

    const testUserId = "11111";
    const testUserStatusId = "22222";
    let testUserStatus;

    beforeEach(async function() {
        testUserStatus = {
            id: testUserStatusId,
            data: {
                currentStatus: validUserCurrentStatus
            },
            userStatusExists: true
        };
    });

    afterEach(async function() {
        await cleanDb();
        sinon.restore();
    });

    describe("validateUserStatus", function() {

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            try {
                await validateUserStatus(testUserId, { ...testUserStatus, userStatusExists: false });
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(USER_STATUS_NOT_FOUND);
            }
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            try {
                await validateUserStatus(testUserId, { 
                    ...testUserStatus,
                    data: {
                        ...testUserStatus.data,
                        currentStatus: {
                            ...testUserStatus.data.currentStatus,
                            state: userState.OOO
                        }
                    }
                });
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal(OOO_STATUS_ALREADY_EXIST);
            }
        });

        it("should return undefined when all validation checks passes", async function() {
            const response = await validateUserStatus(testUserId, testUserStatus);
            expect(response).to.not.exist;
        });
    });

    describe("createOOORequest", function() {

        beforeEach(async function() {
            await updateUserStatus(testUserId, testUserStatus.data);
        });

        it("should return USER_STATUS_NOT_FOUND if user status not found", async function() {
            await deleteUserStatus(testUserId);
            try {
                await createOOORequest(validOooStatusRequests, "test-username-1", testUserId);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal(USER_STATUS_NOT_FOUND);
            }
        });

        it("should return OOO_STATUS_ALREADY_EXIST if user status is already OOO", async function() {
            const testOOOUserStatus = {
                currentStatus: {
                    state: userState.OOO
                }
            };
            await updateUserStatus(testUserId, testOOOUserStatus);
            try {
                await createOOORequest(validOooStatusRequests, "test-username-1", testUserId);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal(OOO_STATUS_ALREADY_EXIST);
            }
        });

        it("should return REQUEST_ALREADY_PENDING if user has already pending request", async function() {
            try {
                await createOOORequest(validOooStatusRequests, "test-username-1", testUserId);
                await createOOORequest(validOooStatusRequests, "test-username-1", testUserId);
            } catch (error) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.statusCode).to.equal(409);
                expect(error.message).to.equal(REQUEST_ALREADY_PENDING);
            }
        });

        it("should create OOO request", async function() {
            const response = await createOOORequest(
                validOooStatusRequests,
                "test-username-1",
                testUserId
            );
            expect(response).to.deep.include({
                type: validOooStatusRequests.type,
                from: validOooStatusRequests.from,
                until: validOooStatusRequests.until,
                reason: validOooStatusRequests.reason,
                status: "PENDING",
                lastModifiedBy: null,
                requestedBy: "test-username-1",
                userId: testUserId,
                comment: null
            });
        });
    });
});
