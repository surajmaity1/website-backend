import sinon from "sinon";
import { skipAuthenticateForOnboardingExtensionRequest } from "../../../middlewares/skipAuthenticateForOnboardingExtension";
import { REQUEST_TYPE } from "../../../constants/requests";
import { assert } from "chai";

describe("skipAuthenticateForOnboardingExtensionRequest Middleware", () => {
    let req, res, next, authenticate: sinon.SinonSpy, verifyDiscordBot: sinon.SinonSpy;
    let middleware;
    beforeEach(() => {
        authenticate = sinon.spy();
        verifyDiscordBot = sinon.spy();
        middleware = skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot);
        req = {
            body:{},
            query:{},
        },
        res = {}
    });

    it("should call authenticate when type is not onboarding", () => {
        req.body.type = REQUEST_TYPE.TASK
        middleware(req, res, next);

        assert.isTrue(authenticate.calledOnce, "authenticate should be called once");
        assert.isTrue(verifyDiscordBot.notCalled, "verifyDiscordBot should not be called");
    });

    it("should call verifyDiscordBot when type is onboarding", async () => {
        req.body.type = REQUEST_TYPE.ONBOARDING;

        middleware(req, res, next);

        assert.isTrue(verifyDiscordBot.calledOnce, "verifyDiscordBot should be called once");
        assert.isTrue(authenticate.notCalled, "authenticate should not be called");
    });
});
