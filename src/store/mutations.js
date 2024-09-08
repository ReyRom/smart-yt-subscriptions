import router from '../router'

export function setUser(state, user){
  state.user = user || []
}
export function setUserRole(state, role){
  state.user.role = role || ''
}
export function setUserId(state, id){
  state.user.id = id || ''
}
export function setUserYoutubeId(state, youtubeId){
  state.user.youtubeId = youtubeId || ''
}
export function setUserChannels(state, channels){
  state.user.subChannels = channels || []
}
export function concatUserChannels(state, channels){
  state.user.subChannels = state.user.subChannels.concat(channels) || state.user.subChannels
}
export function setLastUpdated(state, lastUpdated){
  state.lastUpdated = lastUpdated || ''
}
export function setConnectionStates(state, connectionStates){
  state.connectionStates = connectionStates || ''
}
export function setTheme(state, theme){
  state.theme = theme || ''
}
export function setFolder(state, folder){
  let index = state.folders.findIndex(x => x.guid == folder.guid);
  state.folders[index] = folder 
}
export function addFolder(state, folder){
  state.folders.unshift(folder)
  router.push({
    name: "editFolder",
    params: { "folder": folder.guid }
 })
}
export function removeFolder(state, folderGuid){
  let index = state.folders.findIndex(x => x.guid == folderGuid);
  state.folders.splice(index, 1)
}
export function setFolders(state, folders){
  state.folders = folders || []
}
export function setPublicFolders(state, publicFolders){
  // if (publicFolders.length){
    state.publicFolders = publicFolders || []
  // }
  // else{
  //   state.publicFolders = state.publicFolders.concat(publicFolders)
  // }
}
export function addMessage(state, message){
  state.messages.push(message)
}
export function removeMessage(state, message){
  let index = state.messages.findIndex(m => m == message);
  state.messages.splice(index, 1)
}
export function updateFolders(state, data) {
  if (data.personalFolders) {
    state.folders = data.personalFolders
  }
  if (data.publicFolders) {
    state.publicFolders = data.publicFolders
  }
}


