import { response } from "express";
import { insertUserRequest, selectFederatedCredentialsByIdRequest, insertFederatedCredentialsRequest } from "../../db/requests.js";

export const userDBVerification = async (issuer, profile, cb) => {

    try {
        let response = await selectFederatedCredentialsByIdRequest(issuer, profile.id);
        console.log(response);
        console.log(response.length);

        var userId;

        if (response.length == 0) {
            response = await insertUserRequest(profile.displayName);
            userId = response[0][0];

            await insertFederatedCredentialsRequest(userId, issuer, profile.id);
        }
        else {
            userId = response[0][0];
        }

        const user = {
            id: userId,
            name: profile.displayName
        };

        console.log(user);

        return cb(null, user);
    }
    catch (err) {
        console.log("this right here: " + err);
    }
}