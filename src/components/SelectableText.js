import React, { useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, findNodeHandle } from "react-native";

export const SelectableText = ({
  text,
  hasTVPreferredFocus,
  blockFocusDown,
  blockFocusLeft,
  blockFocusRight,
  blockFocusUp,
  onPress
}) => {
  const selfRef = useRef(null);

  return (
    <TouchableOpacity
      activeOpacity={1.0}
      style={{ opacity: 0.1 }}
      hasTVPreferredFocus={hasTVPreferredFocus}
      ref={selfRef}
      onPress={onPress}
      nextFocusDown={blockFocusDown? findNodeHandle(selfRef.current) : null}
      nextFocusUp={blockFocusUp ? findNodeHandle(selfRef.current) : null}
      nextFocusRight={blockFocusRight ? findNodeHandle(selfRef.current) : null}
      nextFocusLeft={blockFocusLeft ? findNodeHandle(selfRef.current) : null}
    >
      <Text style={styles.settingsText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingsText: {
    textTransform: 'capitalize',
    textAlign: 'center',
    padding: 2
  }
});