import { Stack } from "expo-router";

const RootLayout = () => {
  return <Stack
    screenOptions={{

      headerStyle: {
        backgroundColor: '#4F99B3'
      },

      headerTitleStyle: {
        fontSize: 25,
      }

    }}>

    <Stack.Screen name="index" options={{
      title: "Home",
      headerTitleAlign: "center"
    }} />
    <Stack.Screen name="addTransactions" options={{
      title: "Add Transactions",
      headerTitleAlign: "center"
    }} />
    <Stack.Screen name="viewFinances" options={{
      title: "View Finances",
      headerTitleAlign: "center"
    }} />

  </Stack>
}

export default RootLayout;
