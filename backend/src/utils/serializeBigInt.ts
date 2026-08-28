// src/utils/serializeBigInt.ts

export const serializeBigInt = <T>(data: T): T => {
    return JSON.parse(
        JSON.stringify(data, (_, value) => {
            if (typeof value === "bigint") {
                return value.toString();
            }

            return value;
        })
    );
};