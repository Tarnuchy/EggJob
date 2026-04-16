import react from 'react';
import { View } from 'react-native';

interface Props {
    height: number;
    width: number;
}

export const Spacer = ({ height, width }: Props) => {
    return (
        <View style={{ height, width }} />
    );
};