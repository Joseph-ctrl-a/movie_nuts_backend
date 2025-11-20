function logUserIn() {
  // Get the login form from the page
  const form = document.getElementById('login-form')

  // When the user submits the form (clicks Login)
  form.addEventListener('submit', async e => {
    // Stop the browser from refreshing the page
    e.preventDefault()

    // Get the values typed into the input fields
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    // Send a POST request to our backend with the login details
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', // Tell the server we are sending JSON
      },
      // Convert our email + password into JSON for the server
      body: JSON.stringify({ email, password }),
    })

    // Convert the server's response into a JavaScript object
    const data = await res.json()

    // If the login was successful, redirect to the profile page
    if (data.success) {
      window.location.href = '/frontend/profile.html'
    } else {
      // If login failed, log an error (you could show a message on the page)
      console.log('NOT A SUCCESS')
    }

    // Log the full server response for debugging
    console.log('LOGIN RESPONSE:', data)
  })
}

// Call the function to activate the login behavior
logUserIn()
