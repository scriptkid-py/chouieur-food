'use client';

import { DeliveryOrderForm } from "@/components/admin/DeliveryOrderForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from "@/components/ui/table";


export default function AdminDashboardPage() {

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
            
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Incoming Orders</CardTitle>
                        <CardDescription>New orders from the website waiting for confirmation.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Live order data is currently disconnected.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Order Automation</CardTitle>
                        <CardDescription>Simulate a delivery app order to test the WhatsApp notification flow.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DeliveryOrderForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
