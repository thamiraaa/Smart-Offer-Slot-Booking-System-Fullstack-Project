import React, { useState } from 'react';
import { FileCode, Database, Code, ShieldCheck, ArrowRight, CornerDownRight, Check, Copy } from 'lucide-react';

export default function DotnetCodeViewer() {
  const [activeTab, setActiveTab] = useState<'entity' | 'controller' | 'context' | 'repository' | 'sql'>('entity');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    entity: `using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartOfferBooking.Core.Entities
{
    public class Business
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = "Restaurant"; // Restaurant, Gym, Salon, etc.
        
        [Required, MaxLength(100)]
        public string OwnerName { get; set; } = string.Empty;
        
        [Required, Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Address { get; set; } = string.Empty;
        
        [Required]
        public string City { get; set; } = string.Empty;
        
        public string OpeningTime { get; set; } = "09:00";
        public string ClosingTime { get; set; } = "21:00";
        public string? LogoUrl { get; set; }
    }

    public class Offer
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal OriginalPrice { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal OfferPrice { get; set; }
        
        public int DiscountPercentage => (int)Math.Round(((OriginalPrice - OfferPrice) / OriginalPrice) * 100);
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StartTime { get; set; } = "09:00";
        public string EndTime { get; set; } = "21:00";
        
        public int TotalCapacity { get; set; }
        public int MaxBookingPerCustomer { get; set; } = 2;
        public string TermsAndConditions { get; set; } = string.Empty;
        
        [Required]
        public string Status { get; set; } = "Draft"; // Draft, Active, Paused, Expired, Cancelled
        
        public string? CouponCode { get; set; }
        public decimal CouponDiscount { get; set; } = 0;
        
        public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
    }

    public class OfferSlot
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public Guid OfferId { get; set; }
        public Offer Offer { get; set; } = null!;
        
        [Required]
        public DateTime SlotDate { get; set; }
        
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public int BookedCount { get; set; } = 0;
        public int AvailableCount => Capacity - BookedCount;
        
        public string Status { get; set; } = "Available"; // Available, Full, Closed, Expired, Cancelled
    }

    public class Booking
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required, MaxLength(20)]
        public string ReferenceNumber { get; set; } = string.Empty; // SO-XXXXXX
        
        public Guid OfferId { get; set; }
        public Offer Offer { get; set; } = null!;
        
        public Guid SlotId { get; set; }
        public OfferSlot Slot { get; set; } = null!;
        
        [Required, MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;
        
        [Required, Phone]
        public string PhoneNumber { get; set; } = string.Empty;
        
        [EmailAddress]
        public string? Email { get; set; }
        
        public int NumberOfPeople { get; set; }
        public string? SpecialNote { get; set; }
        
        [Required]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed, NoShow
        public string PaymentStatus { get; set; } = "Unpaid"; // Unpaid, Paid, Refunded
        
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;
        public string? CouponApplied { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPaid { get; set; }
    }
}`,

    controller: `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SmartOfferBooking.Core.DTOs;
using SmartOfferBooking.Core.Services;

namespace SmartOfferBooking.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(IBookingService bookingService, ILogger<BookingsController> logger)
        {
            _bookingService = bookingService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            try
            {
                var result = await _bookingService.CreateBookingAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create booking for slot {SlotId}", dto.SlotId);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            var success = await _bookingService.UpdateBookingStatusAsync(id, dto.Status);
            if (!success) return NotFound(new { error = "Booking not found or update invalid" });
            return Ok(new { success = true, message = "Status updated" });
        }
    }
}`,

    context: `using Microsoft.EntityFrameworkCore;
using SmartOfferBooking.Core.Entities;

namespace SmartOfferBooking.Infrastructure.Data
{
    public class BookingDbContext : DbContext
    {
        public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Offer> Offers { get; set; }
        public DbSet<OfferSlot> OfferSlots { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure PostgreSQL unique indexes & cascade deletes
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.ReferenceNumber)
                .IsUnique();

            modelBuilder.Entity<OfferSlot>()
                .HasOne(s => s.Offer)
                .WithMany(o => o.Slots)
                .HasForeignKey(s => s.OfferId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Offer)
                .WithMany()
                .HasForeignKey(b => b.OfferId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Slot)
                .WithMany()
                .HasForeignKey(b => b.SlotId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed initial Business info
            modelBuilder.Entity<Business>().HasData(new Business
            {
                Id = Guid.Parse("f921a42b-cf0c-4fa2-9381-88df8e8549e3"),
                Name = "Apex Cardio Gym & Spa",
                Type = "Gym",
                OwnerName = "Alexandra Mercer",
                PhoneNumber = "+1 (555) 302-8941",
                Email = "contact@apexcardio.com",
                Address = "742 Elite Boulevard, West Wing",
                City = "San Francisco"
            });
        }
    }
}`,

    repository: `using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SmartOfferBooking.Core.Entities;
using SmartOfferBooking.Infrastructure.Data;

namespace SmartOfferBooking.Infrastructure.Repositories
{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdWithDetailsAsync(Guid id);
        Task<IEnumerable<Booking>> GetAllWithDetailsAsync();
        Task<Booking> AddAsync(Booking booking);
        Task<bool> UpdateStatusAsync(Guid id, string status);
    }

    public class BookingRepository : IBookingRepository
    {
        private readonly BookingDbContext _context;

        public BookingRepository(BookingDbContext context)
        {
            _context = context;
        }

        public async Task<Booking?> GetByIdWithDetailsAsync(Guid id)
        {
            return await _context.Bookings
                .Include(b => b.Offer)
                .Include(b => b.Slot)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetAllWithDetailsAsync()
        {
            return await _context.Bookings
                .Include(b => b.Offer)
                .Include(b => b.Slot)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<Booking> AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> UpdateStatusAsync(Guid id, string status)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return false;
            
            booking.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}`,

    sql: `-- Create Database & Schema - Smart Offer Booking System
-- Database Engine: PostgreSQL 16+

CREATE DATABASE smart_offer_booking;
\\c smart_offer_booking;

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
`
  };

  const labels = {
    entity: 'Entity Models (.cs)',
    controller: 'Web API Controller (.cs)',
    context: 'EF Core DbContext (.cs)',
    repository: 'Repository Layer (.cs)',
    sql: 'PostgreSQL DDL (.sql)'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div id="dotnet-viewer-root" className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div id="dotnet-viewer-header" className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-100">C# .NET 8 / PostgreSQL Backend Export</h4>
            <p className="text-xs text-slate-400">Pragmatic DDD architecture configured with Entity Framework Core & SQL indexes.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-medium">Copied Source!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div id="dotnet-viewer-tabs-container" className="flex items-center gap-1 p-2 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto scrollbar-thin">
        {(Object.keys(codeSnippets) as Array<keyof typeof codeSnippets>).map((key) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setCopied(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === key 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>

      {/* Code Area */}
      <div id="dotnet-viewer-content" className="relative h-[480px] overflow-y-auto font-mono text-[11.5px] leading-relaxed p-4 bg-slate-950">
        <pre className="text-slate-300 select-all selection:bg-indigo-500/30">
          <code>{codeSnippets[activeTab]}</code>
        </pre>
      </div>

      {/* Footer Instructions */}
      <div id="dotnet-viewer-footer" className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Production-grade: Protected endpoints, constraints, checking schema validation.
        </span>
        <div className="flex items-center gap-1">
          <span>Deployment structure is preserved in workspace as</span>
          <code className="px-1.5 py-0.5 bg-slate-800 rounded font-bold text-indigo-400">/backend-dotnet</code>
        </div>
      </div>
    </div>
  );
}
