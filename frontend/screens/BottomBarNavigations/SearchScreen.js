// import React from "react";
// import { View, Text } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const SearchScreen = () => {
//     return (
//       <SafeAreaView>
//         <View>
//             <Text>Search</Text>
//         </View>
//       </SafeAreaView>
//     );
// }

// export default SearchScreen;



import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { searchUsersApi } from "../../utils/api";

const SearchScreen = ({ route, navigation }) => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]); // Default to empty array
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Default to empty object to prevent destructuring null
    const { myId } = route.params || {}; 

    useEffect(() => {
        const getInitialData = async () => {
            try {
                const recent = await AsyncStorage.getItem("recent_searches");
                if (recent) setRecentSearches(JSON.parse(recent));
            } catch (e) { console.log(e); }
        };
        getInitialData();
    }, []);

    const handleTextChange = async (text) => {
        setQuery(text);
        
        if (text.trim().length > 0) {
            setLoading(true);
            try {
                const data = await searchUsersApi(text, myId);
                
                // 🚨 FIX 1: Ensure results is NEVER null. 
                // If backend returns null, we set an empty array [].
                setResults(Array.isArray(data) ? data : []);
            } catch (e) {
                console.log("Search error", e);
                setResults([]);
            } finally {
                setLoading(false);
            }
        } else {
            setResults([]);
        }
    };

    const onSelectUser = async (user) => {
        // Ensure user object exists
        if (!user || !user.id) return;

        let filtered = recentSearches.filter(u => u?.id !== user.id);
        let updatedRecent = [user, ...filtered].slice(0, 8);
        
        setRecentSearches(updatedRecent);
        await AsyncStorage.setItem("recent_searches", JSON.stringify(updatedRecent));
        navigation.navigate("IndividualChats", { recipient: user });
    };

    const renderUserItem = ({ item }) => {
        // 🚨 FIX 2: Safe checks for missing user data
        const displayName = item?.actual_name || "Unknown User";
        const displayUsername = item?.username || "user";
        // Safe string indexing
        const firstLetter = displayName.charAt(0).toUpperCase();

        return (
            <TouchableOpacity style={styles.userCard} onPress={() => onSelectUser(item)}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{firstLetter}</Text>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.nameText}>{displayName}</Text>
                    <Text style={styles.usernameText}>@{displayUsername}</Text>
                </View>
                <Ionicons name="chatbubble-outline" size={20} color="#6366f1" />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <TextInput
                    placeholder="Search for someone..."
                    placeholderTextColor="#000"
                    style={styles.searchInput}
                    autoFocus
                    value={query}
                    onChangeText={handleTextChange}
                />
                {loading && <ActivityIndicator size="small" color="#6366f1" />}
            </View>

            {query.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                    renderItem={renderUserItem}
                    // 🚨 FIX 3: Use optional chaining (?.) so length doesn't crash if results is null
                    ListHeaderComponent={
                        <Text style={styles.sectionTitle}>
                            Found {results?.length || 0} matches
                        </Text>
                    }
                    ListEmptyComponent={!loading && <Text style={styles.emptyText}>No users found</Text>}
                />
            ) : (
                <View style={styles.recentContainer}>
                    <View style={styles.recentHeader}>
                        <Text style={styles.sectionTitle}>Recent Searches</Text>
                        <TouchableOpacity onPress={async () => {
                            setRecentSearches([]);
                            await AsyncStorage.removeItem("recent_searches");
                        }}>
                            <Text style={styles.clearAll}>Clear</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={recentSearches}
                        keyExtractor={(item) => "recent-" + item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.recentItem} 
                                onPress={() => navigation.navigate("IndividualChats", { recipient: item })}
                            >
                                <MaterialIcons name="history" size={20} color="#94a3b8" />
                                <Text style={styles.recentName}>{item.actual_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    searchInput: { flex: 1, marginLeft: 15, fontSize: 17, color: '#1e293b' },
    sectionTitle: { padding: 15, fontSize: 13, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' },
    userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
    avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
    userInfo: { flex: 1, marginLeft: 15 },
    nameText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    usernameText: { fontSize: 13, color: '#94a3b8' },
    recentContainer: { flex: 1 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 15 },
    recentItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    recentName: { marginLeft: 15, fontSize: 16, color: '#475569' },
    clearAll: { color: '#ef4444', fontSize: 12 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});

export default SearchScreen;