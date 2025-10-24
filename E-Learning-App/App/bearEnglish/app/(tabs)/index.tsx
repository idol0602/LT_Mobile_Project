import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Provider, Title } from 'react-native-paper';

import ChatFAB from '../../components/ChatFAB';
import AIChatModal from '../../components/AIChatModal';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <Provider>
      <View style={styles.container}>
        <Title style={styles.mainTitle}>Màn hình chính của ứng dụng</Title>
        <Text style={styles.mainText}>Nhấn vào PopUp hình tròn để mở chat AI.</Text>
        
        {/* Cửa sổ Chat Modal */}
        <AIChatModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
        />
        
        {/* PopUp hình tròn (FAB) */}
        <ChatFAB
          onOpen={() => setModalVisible(true)}
        />

      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  mainTitle: {
    textAlign: 'center', 
    marginTop: 50
  },
  mainText: {
    textAlign: 'center', 
    margin: 10
  }
});
