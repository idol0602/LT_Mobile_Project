import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';

interface ChatFABProps {
  onOpen: () => void;
}

/**
 * Component PopUp hình tròn (Floating Action Button)
 */
const ChatFAB: React.FC<ChatFABProps> = ({ onOpen }) => {
  return (
    <Portal>
      <FAB
        style={styles.fab}
        icon="robot"
        onPress={onOpen}
        label="Chat AI"
      />
    </Portal>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
    width: 100,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    zIndex: 100,
  },
});

export default ChatFAB;