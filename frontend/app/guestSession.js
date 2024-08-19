const createGuestUser = async () => {
    const csrfTokenResp = await fetch("/api/auth/csrf");
    const csrfToken = (await csrfTokenResp.json()).csrfToken;
    const resp = await fetch(
        "/api/auth/callback/email",
        {
            method: 'POST',
            headers:{
            'Content-Type': 'application/x-www-form-urlencoded'
            },    
            body: new URLSearchParams({
                username: '',
                password: '',
                csrfToken,
                json: 'true',
            })
        }
    )
    const respJson = await resp.json();
};

export {
    createGuestUser,
}