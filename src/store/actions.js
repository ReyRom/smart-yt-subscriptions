import * as connections from "../connections";
import cookies from 'vue-cookies';
import router from '../router'; // Added router import

export function getConnectionState({ commit }) {
    connections.axiosClient.get(`Auth/GetConnectionState`)
        .then(({ data }) => {
            commit('setConnectionStates', data)
        })
}
// export function updateYoutubeId({ commit }, payload){
//     connections.axiosClient.post(`User/UpdateYoutubeId?id=${payload.id}&youtubeId=${payload.youtubeId}`)
//         .then(({ data }) => {
//             if (data){
//                 let message = {
//                     title: "Успех",
//                     message: "Идентификатор youtube успешно обновлён",
//                     style: "alert-success"
//                 }
//                 commit("addMessage", message)
//                 commit("setUserYoutubeId", payload.youtubeId)
//                 let user = JSON.parse(localStorage.getItem('user'))
//                 user.youtubeId = payload.youtubeId
//                 localStorage.setItem("user", JSON.stringify(user))
//             }
//             else {
//                 let message = {
//                     title: "Ошибка",
//                     message: "Не удалось обновить идентификатор youtube",
//                     style: "alert-danger"
//                 }
//                 commit("addMessage", message)
//             }
//         })
// }
export function updateSubChannels({ commit }, payload) {
    connections.axiosClient.post(`User/UpdateSubChannels?id=${payload.id}`,
        { "channels": payload.responseData })
        .then(({ data }) => {
            commit('setLastUpdated', data)
            let message = {
                title: "Успех",
                message: `Список каналов успешно обновлён. Найдено каналов: ${payload.responseData.length}`,
                style: "alert-success"
            }
            commit("addMessage", message)
        });
}
export function getUserData({ commit }, payload) {
    connections.axiosClient.get(`User/GetData?email=${payload.email}&youtubeId=${payload.youtubeId}`)
        .then(({ data }) => {
            let states = { "backend": true, "database": true }
            commit('setConnectionStates', states)
            commit('setUserId', data.id)
            commit('setUserYoutubeId', data.youtubeId)
            commit('setUserRole', data.role)
            if (data.subChannelsJson != "") {
                commit('setChannels', data.subChannelsJson)
            }
            else {
                commit('setChannels')
            }
            commit('setLastUpdated', data.lastChannelsUpdate)
            if (data.folders != "") {
                commit('setFolders', data.folders)
            }
        })
}
export function updateFolder({ commit }, payload) {
    connections.axiosClient.post(`Folder/Update`, payload)
        .then(({ data }) => {
            commit('setFolder', data)
        });
}
// export function createFolder({ commit }, payload) {
//     connections.axiosClient.post(`Folder/Create?id=${payload.id}&name=${payload.name}`)
//         .then(({ data }) => {
//             commit('addFolder', data)
//         });
// }
// export function deleteFolder({ commit }, payload) {
//     connections.axiosClient.post(`Folder/Delete?id=${payload.id}&userId=${payload.userId}`)
//         .then(({ data }) => {
//             if (data == true) {
//                 commit('removeFolder', payload.id)
//             }
//         });
// }
export async function createFolder({ commit, dispatch }, payload) {
    let delegate = async () => {
        let token = cookies.get('token');
        let headers = { 'Authorization': `Bearer ${token}` };
        const { data } = await connections.axiosClient.post(`/api/v1/Folders`, { name: payload.name }, { headers });
        commit('addFolder', data);
    };
    await refreshTokenWrapper(delegate, { dispatch });
}
export async function deleteFolder({ commit, dispatch }, payload) {
    let delegate = async () => {
        let token = cookies.get('token');
        let headers = { 'Authorization': `Bearer ${token}` };
        const { data } = await connections.axiosClient.delete(`/api/v1/Folders/${payload.id}`, { headers });
        if (data == true) {
            commit('removeFolder', payload.id);
        }
    };
    await refreshTokenWrapper(delegate, { dispatch });
}
export function setPublicFolders({ commit }, userId) {
    connections.axiosClient.get(`Folder/GetPublicFolders?userId=${userId}`)
        .then(({ data }) => {
            if (data != "") {
                commit('setPublicFolders', data)
            }
            else {
                commit('setPublicFolders', [])
            }
        })
}
export async function authorizeUser({ commit }, accessToken) {
    try {
        const { data } = await connections.axiosClient.get(`/api/v1/Authorization?accessToken=${accessToken}`);
        if (data && data.userData) {
            commit('setUser', data.userData);
            cookies.set('token', data.token, Infinity);
            cookies.set('refreshToken', data.refreshToken, Infinity);
        } else {
            console.error('Invalid response from Authorization');
        }
    } catch (error) {
        console.error('Error authorizing user:', error);
    }
}
export async function updateYoutubeId({ commit, dispatch }, payload) {
    let delegate = async () => {
        let token = cookies.get('token');
        if (!token) {
            let message = {
                title: "Ошибка",
                message: "Вы не авторизованы",
                style: "alert-danger"
            }
            commit("addMessage", message)
        }
        let headers = { 'Authorization': `Bearer ${token}` };
        try {
            await connections.axiosClient.post(`/api/v1/Users/UpdateYoutubeId`, { youtubeId: payload.youtubeId }, { headers });

            let message = {
                title: "Успех",
                message: "Идентификатор youtube успешно обновлён",
                style: "alert-success"
            }
            commit("addMessage", message)
            commit("setUserYoutubeId", payload.youtubeId)
            let user = JSON.parse(localStorage.getItem('user'))
            user.youtubeId = payload.youtubeId
            localStorage.setItem("user", JSON.stringify(user))
        } catch (error) {
            console.error('Error updating youtube id:', error);
            throw error;
        }
    };
    await refreshTokenWrapper(delegate, { dispatch });
}
export async function getFolders({ commit, dispatch }, userId) {
    let delegate = async () => {
        let token = cookies.get('token');
        let headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        try {
            const { data } = await connections.axiosClient.get(`/api/v1/Folders`, { headers });
            commit('updateFolders', data);
        } catch (error) {
            console.error('Error fetching folders:', error);
            throw error;
        }
    };
    await refreshTokenWrapper(delegate, { dispatch });
}
export async function getFolder({ dispatch }, { folderId: folderGuid, info = false }) {
    let delegate = async () => {
        let token = cookies.get('token');
        let headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        let params = info ? { info } : {};
        try {
            const { data } = await connections.axiosClient.get(`/api/v1/Folders/${folderGuid}`, { headers, params });
            return data;
        } catch (error) {
            console.error('Error fetching folder:', error);
            throw error;
        }
    };
    return refreshTokenWrapper(delegate, { dispatch });
}
export async function refreshTokenWrapper(delegate, context) {
    try {
        return  await delegate();
    } catch (error) {
        if (!(error.response && error.response.status === 401)) {
            throw error; // Rethrow the error if it's not a 401 
        }
        let token = cookies.get('token');
        let refreshToken = cookies.get('refreshToken');
        if (!refreshToken) {
            console.error('No refresh token found');
            await context.dispatch('logout');
            return;
        }
        try {
            const { data } = await connections.axiosClient.post(`/api/v1/Authorization/RefreshToken`,
                { refreshToken: refreshToken },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!(data && data.token)) {
                console.error('Failed to refresh token');
                return;
            }
            cookies.set('token', data.token, Infinity);
            cookies.set('refreshToken', data.refreshToken, Infinity);
            return await delegate();
        } catch (refreshError) {
            if (refreshError.response && refreshError.response.status === 400 && (
                refreshError.response.data.errors.refreshToken[0].code === "RefreshTokenNotValid" ||
                refreshError.response.data.errors.refreshToken[0].code === "RefreshTokenExpired")) {
                console.error('Refresh token is not valid.');
                await context.dispatch('logout');
                await delegate();
            } else {
                console.error('Error refreshing token:', refreshError);
            }
        }
    }
}
export async function logout({ commit }) {
    commit('setUser');
    commit('setFolders');
    commit('setLastUpdated');
    cookies.remove('token');
    cookies.remove('refreshToken');
    localStorage.clear();
    // Redirect to home page
    router.push({ name: 'home' }); // Using router to redirect
}