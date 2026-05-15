// Each function takes the dynamic data and returns a complete HTML string
// In a real app you might use a templating engine like Handlebars or MJML
// for more complex designs

export function welcomeEmail(name: string, role: string): string {
  if (role === "HOST") {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>Start listing your property and earn money.</p>
      <a href="http://localhost:5173/listings" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
      List Your Property
      </a>
    </div>
  `;
  } else {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h1 style="color: #FF5A5F;">Welcome to Airbnb, ${name}!</h1>
    <p>Your account has been created successfully.</p>
    <p>Start exploring listings and book your next stay.</p>
    <a href="http://localhost:5173/listings" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Explore Listings
    </a>
    </div>
    `;
  }
}

export function passwordResetEmail(name: string, resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Password Reset Request</h1>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <p>Click the button below. This link expires in 1 hour.</p>
      <a href="${resetLink}" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        Reset Password
      </a>
      <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
    </div>
  `;
}
export function bookingConfirmationEmail(
  name: string,
  listingName: string,
  checkIn: string,
  checkOut: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Confirmed!</h1>
        <p>Hi ${name}, your booking for ${listingName} is confirmed.</p>
        <p>Check-in: ${checkIn}</p>
        <p>Check-out: ${checkOut}</p>
        <p>We hope you have a great stay!</p>
        <p>
    </div>
  `;
}

export function bookingCancellationEmail(
  name: string,
  listingName: string,
  checkIn: string,
  checkOut: string,
  listingslink: string,
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Booking Cancelled</h1>
        <p>Hi ${name}, your booking for ${listingName} has been cancelled.</p>
        <p>Check-in: ${checkIn}</p>
        <p>Check-out: ${checkOut}</p>
        <p>We hope to host you in the future!</p>
        <p>Explore other listings:</p>
        <a href="${listingslink}" style="background: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
        View Listings
      </a>
    </div>
    `;
}
