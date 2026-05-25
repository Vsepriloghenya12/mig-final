import React from 'react';
import { View } from 'react-native';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardTitle } from './card';
import { Text } from './text';

export function EmptyState({ title, text, action, onPress }) {
  return (
    <View className="px-6 py-12">
      <Card className="items-center border-border bg-card px-6 py-8">
        <CardContent className="items-center gap-2">
          <CardTitle className="text-center text-[21px] text-foreground">{title}</CardTitle>
          {text ? <CardDescription className="text-center leading-5">{text}</CardDescription> : null}
          {action ? (
            <Button onPress={onPress} className="mt-4" accessibilityLabel={action}>
              <Text>{action}</Text>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </View>
  );
}
