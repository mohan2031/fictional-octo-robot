
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import type { Appointment, ShopInquiry, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthGuard } from '../dashboard/auth-guard'; // Re-using the same auth guard
import { AppointmentHistory } from './appointment-history';
import { InquiryHistory } from './inquiry-history';
import { EditProfileForm } from '@/components/edit-profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import { mapToAppointment, mapToShopInquiry, mapToUserProfile } from '@/lib/type-mappers';

export default function MyAccountPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemo(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfileDoc, loading: userProfileLoading } = useDoc(userProfileRef);

  const userProfile: UserProfile | null = useMemo(() => {
    return userProfileDoc ? mapToUserProfile(userProfileDoc) : null;
  }, [userProfileDoc]);

  const appointmentsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'appointments'),
      where('userId', '==', user.uid),
      orderBy('appointmentDate', 'desc')
    );
  }, [firestore, user]);

  const { data: appointmentDocs, loading: appointmentsLoading } = useCollection(appointmentsQuery);
  const appointments: Appointment[] | null = useMemo(() => {
    if (!appointmentDocs) return null;
    return appointmentDocs.map(mapToAppointment).sort((a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime());
  }, [appointmentDocs]);


  const inquiriesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'shop-inquiries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: inquiryDocs, loading: inquiriesLoading } = useCollection(inquiriesQuery);
  const inquiries: ShopInquiry[] | null = useMemo(() => {
    if (!inquiryDocs) return null;
    return inquiryDocs.map(mapToShopInquiry).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [inquiryDocs]);


  return (
    <AuthGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8 max-w-4xl mx-auto">
          <div className="text-left">
            <h2 className="text-3xl font-bold font-headline">My Account</h2>
            <p className="text-muted-foreground">
              View your appointments, inquiries, and manage your account settings.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfileLoading ? (
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                   <Skeleton className="h-10 w-32 ml-auto" />
                </div>
              ) : userProfile ? (
                <EditProfileForm profile={userProfile} />
              ) : (
                <p>Could not load your profile information.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>Here is a list of your past and upcoming appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppointmentHistory
                appointments={appointments}
                loading={appointmentsLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Shop Inquiries</CardTitle>
              <CardDescription>Here is a list of your recent messages to local shops.</CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryHistory
                inquiries={inquiries}
                loading={inquiriesLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}
