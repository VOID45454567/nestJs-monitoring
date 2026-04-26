import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { SMTP_CONFIG } from '@/conf/machines';

const createTransporter = () => {
    console.log('Creating email transporter with config:', {
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        secure: SMTP_CONFIG.secure,
        user: SMTP_CONFIG.auth.user,
    });

    return nodemailer.createTransport({
        host: SMTP_CONFIG.host,
        port: SMTP_CONFIG.port,
        secure: SMTP_CONFIG.secure,
        auth: {
            user: SMTP_CONFIG.auth.user,
            pass: SMTP_CONFIG.auth.pass,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

export async function POST(req: NextRequest) {
    try {
        const { to, subject, html } = await req.json();

        console.log('Sending email:', { to, subject });

        if (!to || !subject || !html) {
            console.error('Missing required fields');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const transporter = createTransporter();

        try {
            await transporter.verify();
            console.log('SMTP connection verified');
        } catch (verifyError) {
            console.error('SMTP verification failed:', verifyError);
            return NextResponse.json(
                { error: 'SMTP connection failed', details: String(verifyError) },
                { status: 500 }
            );
        }

        const info = await transporter.sendMail({
            from: SMTP_CONFIG.from,
            to,
            subject,
            html,
        });

        console.log('Email sent successfully:', info.messageId);

        return NextResponse.json({
            success: true,
            messageId: info.messageId,
        });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json(
            {
                error: 'Failed to send email',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}