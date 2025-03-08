import { REQUEST_TYPE } from "../constants/requests";

export type currentStatus = {
    from: number,
    until: number,
    state: REQUEST_TYPE,
    message: string,
    updatedAt: number,
};
