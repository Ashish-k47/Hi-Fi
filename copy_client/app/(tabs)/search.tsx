import React, { useEffect, useState } from 'react'
import type {Conversation, User as IUser} from '../../types'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from '../../assets/styles/SearchScreen.styles'
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TextInput } from 'react-native-gesture-handler'
import { Colors } from '../../constants/Colors'
import Avatar from '../../components/Avatar'
import { api, useApp } from '../../context/AppContext'

export default function search() {

  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<IUser[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const {setConversations, setSelectedConversation} = useApp()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const endPoint = search ? `/api/users/search?query=${search}` : "/api/users";
      const {data} = await api.get<{success: boolean, users:IUser[]}>(endPoint)
      if(data.success) setUsers(data.users)
        setLoading(false)
    } catch (error) {
      setTimeout(fetchUsers, 1000)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    const timer = setTimeout(fetchUsers, 1000)
    return ()=> clearTimeout(timer)
  }, [search])

  const startChat = async (user:IUser) => {
    setLoading(true)
    try {
      const { data } = await api.get<{success: boolean; conversation: Conversation}>(`/api/messages/conversations/with/${user._id}`)

      if (data.success) {
        setSelectedConversation(data.conversation)
        setConversations((prev) => (prev.some((c) => c._id === data.conversation._id) ? prev : [data.conversation, ...prev]))
        router.push(`/chat/${data.conversation._id}`)
      }

    } catch (error) {
      Alert.alert("Error", "Failed to open conversation")
    }finally{
      setLoading(false)
    }
    
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>


      {/* header */}

    <View style={styles.header}>
      <Text style={styles.title}>Search</Text>
    </View>

    {/* search */}

    <View style={styles.searchRow}>
      <Ionicons name='search' size={16} color={Colors.outlineVariant}/>
      <TextInput style={styles.searchInput}
                value={search}
                onChangeText = {setSearch}
                placeholder='Search by name, email or handle...'
                placeholderTextColor={Colors.outlineVariant}
                autoCapitalize='none'/>

          {search.length > 0 && (
            <TouchableOpacity onPress={()=> setSearch("")}>
              <Ionicons name='close-circle' size={16} color={Colors.outlineVariant}/> 
            </TouchableOpacity>
          )}

    </View>


      {/* Results */}
      {loading ? (
        <ActivityIndicator style={{marginTop:40}} color={Colors.primary}/>
      ) : (
        <FlatList
        data={users}
        keyExtractor={(u)=>u._id}
        contentContainerStyle={styles.list}
        renderItem={({item: u})=>(
          <TouchableOpacity disabled={loading} style={styles.userRow} onPress={()=> startChat(u)} activeOpacity={0.7}>
            <Avatar name={u.name} src={u.avatar} size={44} online={u.isOnline}/>
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userHandle}>{u.handle}</Text>
              </View>
              <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
            </View>

          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>{ search ? "No user found" : "Search for people to chat with"}</Text>}/>
      )}

    </SafeAreaView>
  )
}
