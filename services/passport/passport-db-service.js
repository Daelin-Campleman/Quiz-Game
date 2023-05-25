import { insertUserRequest, selectFederatedCredentialsByIdRequest, insertFederatedCredentialsRequest } from "../../db/requests.js";

export const userDBVerification = async (issuer, profile, cb) => {

    try {
        let response = await selectFederatedCredentialsByIdRequest(issuer, profile.id);

        let userId = -1;

        if (response.length == 0) {
            response = await insertUserRequest(profile.displayName);
            userId = response[0].get("user_id");

            await insertFederatedCredentialsRequest(userId, issuer, profile.id);
        }
        else {
            userId = response[0].get("user_id");
        }

        const user = {
            id: userId,
            name: profile.displayName
        };

        return cb(null, user);
    }
    catch (err) {
        console.log(err);
    }
}