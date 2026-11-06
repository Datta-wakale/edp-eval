
const api_url = "https://refactored-happiness-4j97pxggwppr3jq4w-3000.app.github.dev/users";

export const RegisterUser = async(user : any)=> {

    try {
        const response = await fetch(api_url, {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(user)
        })
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("Error occurred", error);
    }
}
