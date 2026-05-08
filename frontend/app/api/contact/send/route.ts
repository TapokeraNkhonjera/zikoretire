import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailContent = `
      New Contact Form Submission from ZikoRetire
      
      Name: ${data.name}
      Email: ${data.email}
      Subject: ${data.subject}
      
      Message:
      ${data.message}
      
      ---
      Sent at: ${new Date().toISOString()}
      This is a school project submission.
    `;

    // Send email using Resend
    const { data: emailData, error } = await resend.emails.send({
      from: 'ZikoRetire Contact <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'tapotandane@gmail.com'],
      subject: `New Contact Form: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${data.name}</p>
            <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${data.email}</p>
            <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
          </div>
          <div style="background: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Sent at: ${new Date().toISOString()}<br>
            This is a school project submission.
          </p>
        </div>
      `,
      text: emailContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', emailData);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully',
        emailId: emailData?.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit contact form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
