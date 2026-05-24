-- Create Database & Schema - Smart Offer Booking System
-- Database Engine: PostgreSQL 16+

CREATE DATABASE smart_offer_booking;
\c smart_offer_booking;

-- Create Businesses Table
CREATE TABLE "Businesses" (
    "Id" UUID PRIMARY KEY,
    "Name" VARCHAR(100) NOT NULL,
    "Type" VARCHAR(50) NOT NULL,
    "OwnerName" VARCHAR(100) NOT NULL,
    "PhoneNumber" VARCHAR(30) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "Address" TEXT NOT NULL,
    "City" VARCHAR(100) NOT NULL,
    "OpeningTime" VARCHAR(5) NOT NULL,
    "ClosingTime" VARCHAR(5) NOT NULL,
    "LogoUrl" VARCHAR(500) NULL
);

-- Create Offers Table
CREATE TABLE "Offers" (
    "Id" UUID PRIMARY KEY,
    "Title" VARCHAR(150) NOT NULL,
    "Description" TEXT NOT NULL,
    "Category" VARCHAR(100) NOT NULL,
    "OriginalPrice" NUMERIC(18,2) NOT NULL,
    "OfferPrice" NUMERIC(18,2) NOT NULL,
    "StartDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "EndDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    "StartTime" VARCHAR(5) NOT NULL,
    "EndTime" VARCHAR(5) NOT NULL,
    "TotalCapacity" INT NOT NULL,
    "MaxBookingPerCustomer" INT NOT NULL DEFAULT 2,
    "TermsAndConditions" TEXT NOT NULL,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Draft',
    "CouponCode" VARCHAR(50) NULL,
    "CouponDiscount" NUMERIC(18,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_price CHECK ("OfferPrice" < "OriginalPrice")
);

-- Create OfferSlots Table
CREATE TABLE "OfferSlots" (
    "Id" UUID PRIMARY KEY,
    "OfferId" UUID NOT NULL REFERENCES "Offers"("Id") ON DELETE CASCADE,
    "SlotDate" DATE NOT NULL,
    "StartTime" VARCHAR(5) NOT NULL,
    "EndTime" VARCHAR(5) NOT NULL,
    "Capacity" INT NOT NULL,
    "BookedCount" INT NOT NULL DEFAULT 0,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Available',
    CONSTRAINT chk_booked_capacity CHECK ("BookedCount" <= "Capacity")
);

-- Create Bookings Table
CREATE TABLE "Bookings" (
    "Id" UUID PRIMARY KEY,
    "ReferenceNumber" VARCHAR(20) NOT NULL UNIQUE,
    "OfferId" UUID NOT NULL REFERENCES "Offers"("Id") ON DELETE RESTRICT,
    "SlotId" UUID NOT NULL REFERENCES "OfferSlots"("Id") ON DELETE RESTRICT,
    "CustomerName" VARCHAR(100) NOT NULL,
    "PhoneNumber" VARCHAR(30) NOT NULL,
    "Email" VARCHAR(150) NULL,
    "NumberOfPeople" INT NOT NULL,
    "SpecialNote" TEXT NULL,
    "Status" VARCHAR(30) NOT NULL DEFAULT 'Pending',
    "PaymentStatus" VARCHAR(30) NOT NULL DEFAULT 'Unpaid',
    "BookingDate" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CouponApplied" VARCHAR(50) NULL,
    "TotalPaid" NUMERIC(18,2) NOT NULL
);

-- Optimization Indexes
CREATE INDEX idx_offers_status ON "Offers"("Status");
CREATE INDEX idx_slots_offer ON "OfferSlots"("OfferId", "SlotDate");
CREATE INDEX idx_bookings_phone ON "Bookings"("PhoneNumber");
CREATE INDEX idx_bookings_ref ON "Bookings"("ReferenceNumber");
