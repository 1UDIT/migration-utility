import { useSelector } from 'react-redux';
import { RootState } from '@/Redux/Store';

export default function tokenExport() {
    const sessionToken = useSelector((state: RootState) => state.tableDownClick.btoken);

    return sessionToken;
} 