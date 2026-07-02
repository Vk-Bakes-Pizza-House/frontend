import { toast } from "sonner";
import { apiRequest } from "./apiRequest";

export const createCrudActions = (
    set,
    endpoint,
    stateKey
) => ({

    fetchAll: async () => {
        set({ loading: true });

        try {
            const data = await apiRequest(
                "get",
                endpoint
            );

            set({
                [stateKey]: data.data,
                loading: false,
            });

        } catch (err) {

            toast.error(err.message);

            set({
                loading: false,
            });
        }
    },

    create: async (payload) => {

        try {

            const data = await apiRequest(
                "post",
                endpoint,
                payload
            );

            set((state) => ({
                [stateKey]: [
                    data.data,
                    ...state[stateKey],
                ],
            }));

            toast.success("Created");

        } catch (err) {

            toast.error(err.message);

        }
    },

    update: async (id, payload) => {

        try {

            const data = await apiRequest(
                "put",
                `${endpoint}/${id}`,
                payload
            );

            set((state) => ({
                [stateKey]:
                    state[stateKey].map((item) =>
                        item._id === id
                            ? data.data
                            : item
                    ),
            }));

            toast.success("Updated");

        } catch (err) {

            toast.error(err.message);

        }
    },

    remove: async (id) => {

        try {

            await apiRequest(
                "delete",
                `${endpoint}/${id}`
            );

            set((state) => ({
                [stateKey]:
                    state[stateKey].filter(
                        (i) => i._id !== id
                    ),
            }));

            toast.success("Deleted");

        } catch (err) {

            toast.error(err.message);

        }
    },

});