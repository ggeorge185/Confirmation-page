# Confirmation Page System

A web-based system for tracking student participation and photo consent confirmations.

## Features

- **Student Confirmation Page**: Students click a unique link to confirm their participation and photo consent
- **Admin Panel**: Generate confirmation links and view all confirmations
- **Tracking System**: All confirmations are stored locally and can be viewed/managed
- **Responsive Design**: Works on desktop and mobile devices
- **No Backend Required**: Uses browser localStorage for data storage

## Quick Start

1. **Deploy the files**: Upload all files to a web server or open `index.html` locally
2. **Access Admin Panel**: Open `admin.html` to generate confirmation links
3. **Send Links to Students**: Use the generated links in emails to students
4. **Track Confirmations**: View all confirmations in the admin panel

## How to Use

### For Administrators

1. **Open Admin Panel**: Navigate to `admin.html`
2. **Generate Individual Links**:
   - Enter student name and email
   - Click "Generate Link"
   - Copy the generated link to send to the student

3. **Generate Bulk Links**:
   - Enter multiple students in the format: `Name <email@domain.com>`
   - Click "Generate All Links"
   - Copy all links or download as CSV

4. **View Confirmations**:
   - See real-time statistics
   - View all confirmations in a table
   - Refresh data or clear all confirmations

### For Students

1. **Click the Link**: Students receive a unique confirmation link via email
2. **Review Information**: Students see what they're confirming (participation + photo consent)
3. **Confirm**: Click the confirmation button to register their consent
4. **Confirmation**: Receive immediate confirmation of their registration

## File Structure

```
/
├── index.html          # Main confirmation page for students
├── admin.html          # Admin panel for managing confirmations
├── styles.css          # Styling for all pages
├── script.js           # Core functionality
├── admin.js           # Admin panel functionality
└── README.md          # This file
```

## Example Confirmation Link

```
https://yourdomain.com/?token=abc123def456&name=John%20Doe&email=john%40example.com
```

## Data Storage

- Confirmations are stored in the browser's localStorage
- Data persists across browser sessions
- Data is tied to the specific domain/browser
- For production use, consider implementing a backend database

## Browser Compatibility

- Modern browsers with localStorage support
- Chrome, Firefox, Safari, Edge (recent versions)
- Mobile browsers supported

## Security Considerations

- Links contain encoded student information in URL parameters
- Tokens are randomly generated for uniqueness
- No sensitive data is exposed beyond what's necessary for confirmation
- For enhanced security, consider implementing server-side token validation

## Customization

### Styling
- Edit `styles.css` to match your organization's branding
- Modify colors, fonts, and layout as needed

### Content
- Update text in `index.html` to match your specific requirements
- Modify confirmation requirements (participation, photo consent, etc.)

### Data Storage
- Current implementation uses localStorage
- To implement server-side storage, modify the data storage functions in `script.js`

## Troubleshooting

### Common Issues

1. **Links not working**: Ensure all files are properly deployed to the web server
2. **Data not persisting**: Check if localStorage is enabled in the browser
3. **Mobile display issues**: Verify responsive CSS is loading correctly

### Browser Requirements

- JavaScript must be enabled
- localStorage must be available
- Cookies must be enabled for proper functionality

## Support

For technical support or questions about implementation, please refer to your system administrator or the development team.

## License

This project is provided as-is for educational and organizational use.